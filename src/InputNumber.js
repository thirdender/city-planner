import React, { useEffect, useState } from 'react';
import styles from './InputNumber.module.scss';

const InputNumber = ({ defaultValue, onChange }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <div className={styles.Wrapper}>
      <input
        type="number"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        min={1}
      />
      <button type="button" className={styles.Decrement} onClick={() => setValue(value - 1)}>
        &lt;
        <span className="sr-only">Decrease value</span>
      </button>
      <button type="button" className={styles.Increment} onClick={() => setValue(value + 1)}>
        &gt;
        <span className="sr-only">Increase value</span>
      </button>
    </div>
  );
};

export default InputNumber;
