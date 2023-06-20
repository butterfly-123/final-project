'use client';

import axios from 'axios';
import React, { useState } from 'react';
import Creatable from 'react-select';
import { User } from '../../../database/users';
import { Category } from '../../../migrations/1686916405-createTableCategories';
import { CreateResponseBodyPost } from '../../api/(auth)/users/[userId]/route';
import { LoadImage } from './LoadImage';
import styles from './ProfileForm.module.scss';

type Props = {
  categories: Category[];
  userId: number;
  singleUserData: User;
  userCategories: any[];
  setShowInput: boolean;
  idSelectedCategories: any[];
  nickname: string;
  description: string;
};

interface CategoriesOption {
  readonly value: string;
  readonly label: string;
}

async function save({
  setSelectedOption,
  setUserCategories,
  setShowInput,
  idSelectedCategories,
  userId,
  nickname,
  description,
}: Props) {
  setShowInput(false);
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        idSelectedCategories,
        nickname,
        description,
      }),
    });

    if (response.status !== 500) {
      const data: CreateResponseBodyPost = await response.json();

      if ('error' in data) {
        console.log(data.error);
      }

      if ('user' in data) {
        setUserCategories(data.userCategories);
        setSelectedOption(data.userCategories);
        console.log(data);
      }
    }
  } catch (e) {
    console.log({ e });
  }
}

export default function ProfileForm(props: Props) {
  const singleUserData = props.singleUserData;
  const userCategoriesProps = props.userCategories;

  const [selectedOption, setSelectedOption] = useState(userCategoriesProps);
  const idSelectedCategories = selectedOption?.map((selected) => selected.id);
  const [userCategories, setUserCategories] = useState(userCategoriesProps);
  const [nickname, setNickname] = useState(
    singleUserData.nickname ? singleUserData.nickname : '',
  );
  const [description, setDescription] = useState(
    singleUserData.description ? singleUserData.description : '',
  );
  const [showInput, setShowInput] = useState(true);
  // const [error, setError] = useState<string>('');

  const categories = props.categories;
  const userId = props.userId;

  const categoriesOption: readonly CategoriesOption[] = categories.map(
    (category) => {
      return { id: category.id, value: category.name, label: category.label };
    },
  );

  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFilename(event.target.files[0].name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_UPLOAD_PRESET_NAME');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
        formData,
      );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <p>id: {userId}</p>

      <LoadImage
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        filename={filename}
      />

      {userCategories.map((c) => {
        return (
          <p>
            {c.name} - {c.categoryId}
          </p>
        );
      })}
      <label htmlFor="nickname">Nickname</label>

      {showInput ? (
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.currentTarget.value)}
          required
        />
      ) : (
        <p className={styles.profileData}>{nickname}</p>
      )}

      <label htmlFor="description">Description</label>
      {showInput ? (
        <textarea
          style={{ fontSize: '14px' }}
          name="description"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        >
          Description
        </textarea>
      ) : (
        <p className={styles.profileData}>{description}</p>
      )}

      <Creatable
        className={styles.select}
        closeMenuOnSelect={false}
        components={categoriesOption}
        onChange={setSelectedOption}
        defaultValue={selectedOption}
        isMulti
        options={categoriesOption}
      />

      {showInput ? (
        <button
          className={styles.buttonCreate}
          onClick={async () => {
            await save({
              setSelectedOption,
              setUserCategories,
              setShowInput,
              idSelectedCategories,
              userId,
              nickname,
              description,
            });
          }}
        >
          Save
        </button>
      ) : (
        <button
          className={styles.buttonEdit}
          onClick={() => setShowInput(true)}
        >
          Edit
        </button>
      )}
    </form>
  );
}
