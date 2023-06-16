'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import styles from './ProfileForm.module.scss';

const categories = [
  { value: 'running', label: 'Running' },
  { value: 'travel', label: 'Travel' },
  { value: 'reading', label: 'Reading' },
];

export default function ProfileForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        required
      />
      <label htmlFor="description">Description</label>
      <textarea
        name="description"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      >
        Description
      </textarea>
      <Select
        className={styles.select}
        onChange={setSelectedOption}
        options={categories}
      />
      <button className={styles.buttonCreate}>Create</button>
    </form>
  );
}