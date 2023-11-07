import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";

import { API_PREFIX, ApiPath, OpenaiPath } from "@/app/constant";
import { ModelConfig, ProviderConfig } from "@/app/store";

import { OpenAI } from "./types";

import { ChatOptions, LLMModel, LLMUsage } from "../types";
import Locale from "@/app/locales";

import { prettyObject } from "@/app/utils/format";
import { getApiPath } from "@/app/utils/path";
import { trimEnd } from "@/app/utils/string";
import { omit } from "@/app/utils/object";
import { createLogger } from "@/app/utils/log";
import { getAuthKey } from "../common/auth";
import { OpenAIConfig } from "./config";

export function createOpenAiClient(
  providerConfigs: ProviderConfig,
  modelConfig: ModelConfig,
) {
  const openaiConfig = { ...providerConfigs.openai };
  const logger = createLogger("[OpenAI Client]");
  const openaiModelConfig = { ...modelConfig.openai };

  return {
    headers() {
      return {
        "Content-Type": "application/json",
        Authorization: getAuthKey(),
      };
    },

    path(path: OpenaiPath): string {
      let baseUrl: string = openaiConfig.endpoint;

      // if endpoint is empty, use default endpoint
      if (baseUrl.trim().length === 0) {
        baseUrl = getApiPath(ApiPath.OpenAI);
      }

      if (!baseUrl.startsWith("http") && !baseUrl.startsWith(API_PREFIX)) {
        baseUrl = "https://" + baseUrl;
      }

      baseUrl = trimEnd(baseUrl, "/");

      return `${baseUrl}/${path}`;
    },

    extractMessage(res: OpenAI.ChatCompletionResponse) {
      return res.choices[0]?.message?.content ?? "";
    },

    beforeRequest(options: ChatOptions, stream = false) {
      const messages = options.messages.map((v) => ({
        role: v.role,
        content: v.content,
      }));

      if (options.shouldSummarize) {
        openaiModelConfig.model = openaiModelConfig.summarizeModel;
      }

      const requestBody: OpenAI.ChatCompletionRequest = {
        messages,
        stream,
        ...omit(openaiModelConfig, "summarizeModel"),
      };

      const path = this.path(OpenaiPath.Chat);

      logger.log("path = ", path, requestBody);

      const controller = new AbortController();
      options.onController?.(controller);

      const payload = {
        method: "POST",
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        headers: this.headers(),
      };

      return {
        path,
        payload,
        controller,
      };
    },

    async chat(options: ChatOptions) {
      try {
        const { path, payload, controller } = this.beforeRequest(
          options,
          false,
        );

        controller.signal.onabort = () => options.onFinish("");

        const res = await fetch(path, payload);
        const resJson = await res.json();

        const message = this.extractMessage(resJson);
        options.onFinish(message);
      } catch (e) {
        logger.error("failed to chat", e);
        options.onError?.(e as Error);
      }
    },

    async chatStream(options: ChatOptions) {
      try {
        const { path, payload, controller } = this.beforeRequest(options, true);

        const context = {
          text: "",
          finished: false,
        };

        const finish = () => {
          if (!context.finished) {
            options.onFinish(context.text);
            context.finished = true;
          }
        };

        controller.signal.onabort = finish;

        fetchEventSource(path, {
          ...payload,
          async onopen(res) {
            const contentType = res.headers.get("content-type");
            logger.log("response content type: ", contentType);

            if (contentType?.startsWith("text/plain")) {
              context.text = await res.clone().text();
              return finish();
            }

            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              const responseTexts = [context.text];
              let extraInfo = await res.clone().text();
              try {
                const resJson = await res.clone().json();
                extraInfo = prettyObject(resJson);
              } catch {}

              if (res.status === 401) {
                responseTexts.push(Locale.Error.Unauthorized);
              }

              if (extraInfo) {
                responseTexts.push(extraInfo);
              }

              context.text = responseTexts.join("\n\n");

              return finish();
            }
          },
          onmessage(msg) {
            if (msg.data === "[DONE]" || context.finished) {
              return finish();
            }
            const chunk = msg.data;
            try {
              const chunkJson = JSON.parse(
                chunk,
              ) as OpenAI.ChatCompletionStreamResponse;
              const delta = chunkJson.choices[0].delta.content;
              if (delta) {
                context.text += delta;
                options.onUpdate?.(context.text, delta);
              }
            } catch (e) {
              logger.error("[Request] parse error", chunk, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
          },
          openWhenHidden: true,
        });
      } catch (e) {
        logger.error("failed to chat", e);
        options.onError?.(e as Error);
      }
    },

    async usage() {
      return {
        used: 0,
        total: 0,
      } as LLMUsage;
    },

    async models(): Promise<LLMModel[]> {
      const customModels = openaiConfig.customModels
        .split(",")
        .map((v) => v.trim())
        .filter((v) => !!v)
        .map((v) => ({
          name: v,
          available: true,
        }));

      if (!openaiConfig.autoFetchModels) {
        return [...OpenAIConfig.provider.models.slice(), ...customModels];
      }

      const res = await fetch(this.path(OpenaiPath.ListModel), {
        method: "GET",
        headers: this.headers(),
      });

      const resJson = (await res.json()) as OpenAI.ListModelResponse;
      const chatModels =
        resJson.data?.filter((m) => m.id.startsWith("gpt-")) ?? [];

      return chatModels
        .map((m) => ({
          name: m.id,
          available: true,
        }))
        .concat(customModels);
    },
  };
}
