import { ModalConfigValidator, ModelConfig, useAppConfig } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, Select } from "./ui-lib";

export function _ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  return null;
  /*
  const config = useAppConfig();

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          value={props.modelConfig.model}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.model = ModalConfigValidator.model(
                  e.currentTarget.value,
                )),
            );
          }}
        >
          {config.allModels().map((v, i) => (
            <option value={v.name} key={i} disabled={!v.available}>
              {v.name}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <InputRange
          value={props.modelConfig.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.temperature = ModalConfigValidator.temperature(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.TopP.Title}
        subTitle={Locale.Settings.TopP.SubTitle}
      >
        <InputRange
          value={(props.modelConfig.top_p ?? 1).toFixed(1)}
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.top_p = ModalConfigValidator.top_p(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
      >
        <input
          type="number"
          min={100}
          max={100000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens = ModalConfigValidator.max_tokens(
                  e.currentTarget.valueAsNumber,
                )),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.PresencePenalty.Title}
        subTitle={Locale.Settings.PresencePenalty.SubTitle}
      >
        <InputRange
          value={props.modelConfig.presence_penalty?.toFixed(1)}
          min="-2"
          max="2"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.presence_penalty =
                  ModalConfigValidator.presence_penalty(
                    e.currentTarget.valueAsNumber,
                  )),
            );
          }}
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.FrequencyPenalty.Title}
        subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
      >
        <InputRange
          value={props.modelConfig.frequency_penalty?.toFixed(1)}
          min="-2"
          max="2"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.frequency_penalty =
                  ModalConfigValidator.frequency_penalty(
                    e.currentTarget.valueAsNumber,
                  )),
            );
          }}
        ></InputRange>
      </ListItem>

      
    </>
  );
  */
}
