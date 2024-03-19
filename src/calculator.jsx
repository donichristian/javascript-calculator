import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

// Define the Calculator component
const Calculator = () => {
  // Define an array of objects representing each key in the calculator
  const calData = [
    { id: "clear", value: "AC" },
    { id: "divide", value: "/" },
    { id: "multiply", value: "x" },
    { id: "seven", value: 7 },
    { id: "eight", value: 8 },
    { id: "nine", value: 9 },
    { id: "subtract", value: "-" },
    { id: "four", value: 4 },
    { id: "five", value: 5 },
    { id: "six", value: 6 },
    { id: "add", value: "+" },
    { id: "one", value: 1 },
    { id: "two", value: 2 },
    { id: "three", value: 3 },
    { id: "equals", value: "=" },
    { id: "zero", value: 0 },
    { id: "decimal", value: "." },
  ];

  // Define an array containing the operators
  const operators = useMemo(() => ["AC", "/", "x", "+", "-"], []);

  // Define an array containing the numbers
  const numbers = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], []);

  // Define state variables to manage calculator data
  const [input, setInput] = useState("0");
  const [output, setOutput] = useState("");
  const [calculatorData, setCalculatorData] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const [lastOperation, setLastOperation] = useState("");
  const [lastNumber, setLastNumber] = useState("");

  // Function to clear the calculator
  const handleClear = useCallback(() => {
    setInput("0");
    setCalculatorData("");
    setOutput("");
    setJustCalculated(false);
    setLastResult("");
    setLastOperation("");
    setLastNumber("");
  }, []);

  // Function to handle input of numbers
  const handleNumbers = useCallback(
    (value) => {
      if (!calculatorData.length || input === "0") {
        setInput(value.toString());
        setCalculatorData(value.toString());
      } else {
        if (value === 0 && (calculatorData === "0" || input === "0")) {
          setCalculatorData(calculatorData);
        } else {
          const lastChar = calculatorData.charAt(calculatorData.length - 1);
          const isLastCharOperator = operators.includes(lastChar);
  
          setInput(isLastCharOperator ? value.toString() : input + value);
          setCalculatorData(calculatorData + value);
        }
      }
    },
    [calculatorData, input, operators]
  );

  // Function to handle input of decimal point
  const handleDecimal = useCallback(() => {
    const lastChar = calculatorData.charAt(calculatorData.length - 1);
    if (!calculatorData.length) {
      setInput("0.");
      setCalculatorData("0.");
    } else {
      if (lastChar === "*" || operators.includes(lastChar)) {
        setInput("0.");
        setCalculatorData(`${calculatorData} 0.`);
      } else {
        setInput(lastChar === "." || input.includes(".") ? input : input + ".");
        const formattedValue =
          lastChar === "." || input.includes(".")
            ? `${calculatorData}`
            : `${calculatorData}.`;
        setCalculatorData(formattedValue);
      }
    }
  }, [calculatorData, input, operators]);

  // Function to handle input of operators
  const handleOperators = useCallback(
    (value) => {
      if (calculatorData.length) {
        setJustCalculated(false);
  
        const lastChar = calculatorData.charAt(calculatorData.length - 1);
  
        if (value === "-" && lastChar === "-") {
          // If the last character was already a negative sign, ignore the current one
          return;
        }
  
        if (value === "-" && operators.includes(lastChar)) {
          // If the last character was an operator and the current operator is '-', append it
          setCalculatorData(calculatorData + value);
          return;
        }
  
        const regex = /(-?\d+(\.\d+)?)$/;
        const matches = calculatorData.match(regex);
        const prevNumber = matches ? matches[1] : "";
  
        const updatedValue = `${prevNumber}${value}`;
  
        setCalculatorData(updatedValue);
        setLastOperation(value);
        setLastNumber(prevNumber);
  
        setInput(input === "0" || input === "" ? "" : input);
  
        if (lastOperation && calculatorData.includes(lastOperation)) {
          const temp = calculatorData.split(lastOperation);
          if (temp.length === 2) {
            setLastNumber(temp[1].trim());
          } else {
            console.error("Invalid splitting:", temp);
          }
        }
      }
    },
    [calculatorData, input, lastOperation, lastNumber]
  );

  // Function to handle submission of the "=" button
  const handleSubmit = useCallback(() => {
    if (calculatorData) {
      const regex = /(-?\d+(\.\d+)?)\s*([+\-*/x])\s*(-?\d+(\.\d+)?)/;
      const matches = calculatorData.match(regex);
      const firstNumber = matches ? matches[1] : "";
      const currentOperation = matches
        ? matches[3] === "x"
          ? "*"
          : matches[3]
        : "";
      const secondNumber = matches ? matches[4] : "";

      let total = eval(calculatorData.replace(/x/g, "*"));

      setInput(total.toString());
      setOutput(
        `${firstNumber} ${
          currentOperation === "*" ? "x" : currentOperation
        } ${secondNumber} =`
      );
      setCalculatorData(total.toString());
      setJustCalculated(true);
      setLastResult(total);

      if (currentOperation) {
        setLastOperation(currentOperation);
        setLastNumber(secondNumber);
      }
    }

    if (
      justCalculated &&
      lastResult !== undefined &&
      lastOperation &&
      lastNumber !== undefined
    ) {
      const expression = `${lastResult} ${lastOperation} ${lastNumber}`;
      const newTotal = eval(expression.replace(/x/g, "*"));
      setInput(newTotal.toString());
      setOutput(
        `${lastResult} ${
          lastOperation === "*" ? "x" : lastOperation
        } ${lastNumber} =`
      );
      setCalculatorData(newTotal.toString());
      setJustCalculated(true);
      setLastResult(newTotal);
    }
  }, [calculatorData, justCalculated, lastNumber, lastOperation, lastResult]);

  // Function to handle all types of input
  const handleInput = useCallback(
    (value) => {
      const number = numbers.find((num) => num === value);
      const operator = operators.find((op) => op === value);
      // Determine the type of input and handle accordingly
      switch (value) {
        case "=":
          // If "=" is pressed and a calculation is not just completed, submit the calculation
          if (!justCalculated) {
            handleSubmit();
          }
          break;
        case "AC":
          // Clear the calculator
          handleClear();
          break;
        case ".":
          // Handle input of decimal point
          handleDecimal();
          break;
        case number:
          // If a number is pressed and a calculation was just completed, reset the input
          if (justCalculated) {
            setInput(value.toString());
            setCalculatorData(value.toString());
            setJustCalculated(false);
          } else {
            // Otherwise, handle the input of numbers
            handleNumbers(value);
          }
          break;
        case operator:
          // Handle the input of operators
          handleOperators(value);
          // Split the calculator data to retrieve the last number if available
          if (lastOperation && calculatorData.length > 1) {
            const temp = calculatorData.split(lastOperation);
            if (temp.length >= 2) {
              setLastNumber(temp.pop().trim());
            } else {
              console.error("Invalid splitting:", temp);
            }
          }
          setLastOperation(value);
          break;
        default:
          break;
      }
    },
    [
      calculatorData,
      handleClear,
      handleDecimal,
      handleNumbers,
      handleOperators,
      handleSubmit,
      justCalculated,
      lastNumber,
      lastOperation,
      numbers,
      operators,
    ]
  );

  // Function to handle keydown events
  const handleKeyDown = useCallback(
    (event) => {
      const { key, shiftKey } = event;
      if (key === "Enter") {
        // If Enter is pressed, submit the calculation
        handleSubmit();
      } else if (key === "Escape" || key === "Backspace" || key === "Delete") {
        // If Escape, Backspace, or Delete is pressed, clear the calculator
        handleClear();
      } else if (key === ".") {
        // If "." is pressed, handle the input of decimal point
        handleDecimal();
      } else if (key === "0" && justCalculated) {
        // If "0" is pressed after a calculation, reset the input
        setInput("0");
        setCalculatorData("");
        setJustCalculated(false);
      } else if (numbers.includes(Number(key))) {
        // If a number is pressed, handle the input of numbers
        handleNumbers(Number(key));
      } else if (operators.includes(key)) {
        // If an operator is pressed, handle the input of operators
        handleOperators(key);
      } else if (shiftKey && (key === "*" || key === "+")) {
        // If Shift is pressed along with "*" or "+", handle the input of operators
        handleOperators(key);
      } else if (!shiftKey && (key === "*" || key === "+")) {
        // If "*" or "+" is pressed, handle the input of operators
        handleOperators(shiftKey ? key : key === "*" ? "x" : key);
      }
    },
    [
      handleClear,
      handleDecimal,
      handleNumbers,
      handleOperators,
      handleSubmit,
      justCalculated,
      numbers,
      operators,
    ]
  );

  // Effect hook to handle keydown events and update output
  useEffect(() => {
    if (!justCalculated) {
      setOutput(calculatorData);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [calculatorData, handleKeyDown, justCalculated]);

  // Key component to render calculator keys
  const Key = ({ keyData: { id, value }, handleInput }) => (
    <button onClick={() => handleInput(value)} key={id} id={id}>
      {value}
    </button>
  );

  // Prop types for the Key component
  Key.propTypes = {
    keyData: PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }).isRequired,
    handleInput: PropTypes.func.isRequired,
  };

  // Return the Calculator component
  return (
    <div className="container">
      <div className="calculator">
        <div className="output">
          <span className="result">{output}</span>
          <span id="display" className="input">
            {input}
          </span>
        </div>
        <div className="keys">
          {calData.map((key) => (
            <Key key={key.id} keyData={key} handleInput={handleInput}/>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export the Calculator component
export default Calculator;