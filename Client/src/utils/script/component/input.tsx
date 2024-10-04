import "./input.css";
import { useState } from "react";

const InputField = ({
  placeholder,
  type,
  isCheckedInitially,
  onValueChange,
  min,
  max,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    if (!checked) {
      setInputValue("");
      if (onValueChange) {
        onValueChange("");
      }
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };
  const handleInputBlur = () => {
    let value = Number(inputValue);

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    setInputValue(value.toString());
    if (onValueChange) {
      onValueChange(value.toString());
    }
  };

  return (
    <>
      <div className="flex flex-row items-center w-full">
        <div className="w-full">
          <input
            className="flip-card__input"
            placeholder={placeholder}
            type={type}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={isCheckedInitially ? !isChecked : false}
            min={min}
            max={max}
          />
        </div>
        {isCheckedInitially && (
          <div>
            <label className="container">
              <input
                checked={isChecked}
                onChange={handleCheckboxChange}
                type="checkbox"
              />
              <div className="checkmark"></div>
            </label>
          </div>
        )}
      </div>
    </>
  );
};

export default InputField;