
import React, { useState, useRef } from 'react';
import { Parser } from 'expr-eval';

const FormulaForm = () => {
  const [fields, setFields] = useState({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
  });
  const [formula, setFormula] = useState('');
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const textareaRef = useRef(null);
  const fieldNames = Object.keys(fields);

  const handleInputChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleFormulaChange = (e) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;

    setFormula(value);
    setCursorPos(cursor);

    // Show suggestions only if last character typed is "@"
    if (value[cursor - 1] === '@') {
      setSuggestionsVisible(true);
    } else {
      setSuggestionsVisible(false);
    }
  };

  const insertField = (fieldName) => {
    const before = formula.slice(0, cursorPos - 1);
    const after = formula.slice(cursorPos);
    const updatedFormula = `${before}${fieldName}${after}`;

    setFormula(updatedFormula);
    setSuggestionsVisible(false);

    // Refocus and set cursor
    setTimeout(() => {
      const pos = before.length + fieldName.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
      setCursorPos(pos);
    }, 0);
  };

  const handleCalculate = () => {
    try {
      setError('');
      const parser = new Parser();

      const numericValues = Object.fromEntries(
        Object.entries(fields).map(([key, val]) => [key, parseFloat(val) || 0])
      );

      const expr = parser.parse(formula);
      const calcResult = expr.evaluate(numericValues);
      setResult(calcResult);
    } catch (err) {
      setError('Invalid formula.');
      setResult(null);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>Formula Calculator</h2>

      {fieldNames.map((field) => (
        <div key={field} style={{ marginBottom: 10 }}>
          <label>{field}: </label>
          <input
            type="number"
            name={field}
            value={fields[field]}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>
      ))}

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <label>Formula:</label>
        <textarea
          ref={textareaRef}
          value={formula}
          onChange={handleFormulaChange}
          rows={3}
          style={{ width: '100%', padding: '6px' }}
          placeholder="Type @ to insert field, e.g. (field1 + field2) / field3"
        />
        {suggestionsVisible && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            width: '100%',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {fieldNames.map(name => (
              <div
                key={name}
                style={{
                  padding: '5px 10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
                onClick={() => insertField(name)}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleCalculate}>Calculate</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result !== null && <div style={{ marginTop: 10 }}><b>Result: {result}</b></div>}
    </div>
  );
};

export default FormulaForm;
