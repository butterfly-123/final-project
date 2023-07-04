'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { CiCircleRemove } from 'react-icons/ci';
import Creatable from 'react-select';
import { UserWithCategory } from '../../../database/users';
import { User } from '../../../migrations/1686751602-createTableUsers';
import { Category } from '../../../migrations/1686916405-createTableCategories';
import { CreateResponseBodyPut } from '../../api/(auth)/users/[userId]/route';
import { LoadImage } from './LoadImage';
import styles from './ProfileForm.module.scss';

type Props = {
  categories: Category[];
  userId: number;
  singleUserData: User[];
  userCategories: any[];
  userContacts: UserWithCategory[];
};

type SaveProps = Props & {
  setShowInput: (value: boolean) => void;
  setSelectedOption: (value: Category[]) => void;
  setUserCategories: (value: Category[]) => void;
  setImageUrl: (value: string) => void;
  setIsLoading: (value: boolean) => void;
  idSelectedCategories: (value: boolean) => void;
  result: (value: boolean) => void;
  nickname: string;
  description: string;
  imageUrl: string;
};

interface CategoriesOption {
  readonly value: string;
  readonly label: string;
}

interface RemoveParams {
  contactId: string;
  setIsLoadingRemove: React.Dispatch<React.SetStateAction<boolean>>;
}

async function remove({ contactId, setIsLoadingRemove }: RemoveParams) {
  setIsLoadingRemove(true);
  try {
    const response = await fetch(`/api/contacts/${contactId}`, {
      method: 'DELETE',
      body: JSON.stringify({ contactId }),
    });

    setIsLoadingRemove(false);

    if (response.status !== 500) {
      const data: CreateResponseBodyPut = await response.json();

      if ('error' in data) {
        console.log(data.error);
      }

      if ('user' in data) {
        console.log(data.user);
      }
    }
  } catch (e) {
    console.log({ e });
  }
}

async function save({
  setSelectedOption,
  setUserCategories,
  setImageUrl,
  setShowInput,
  idSelectedCategories,
  setIsLoading,
  userId,
  imageUrl,
  nickname,
  description,
}: SaveProps) {
  setShowInput(true);
  try {
    setIsLoading(true);
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        idSelectedCategories,
        nickname,
        imageUrl,
        description,
      }),
    });

    setIsLoading(false);

    if (response.status !== 500) {
      const data: CreateResponseBodyPut = await response.json();

      if ('error' in data) {
        console.log(data.error);
      }

      if ('user' in data) {
        setImageUrl(data.user.imageUrl);
        setUserCategories(data.userCategories);
        setSelectedOption(data.userCategories);
      }
    }
  } catch (e) {
    console.log({ e });
  }
}

export default function ProfileForm(props: Props) {
  const singleUserData = props.singleUserData;
  const userCategoriesProps = props.userCategories;
  const userContactsProps = props.userContacts;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState(false);
  const [selectedOption, setSelectedOption] = useState(userCategoriesProps);

  const idSelectedCategories = selectedOption.map((selected) => selected.id);
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

  const [imageUrl, setImageUrl] = useState(
    singleUserData.imageUrl ? singleUserData.imageUrl : '',
  );
  const [uploadData, setUploadData] = useState();

  async function handleOnChange(changeEvent) {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setImageUrl(onLoadEvent.target.result);
      setUploadData(undefined);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);

    const formData = new FormData();

    for (const file of changeEvent.target.files) {
      formData.append('file', file);
    }

    formData.append('upload_preset', 'my-uploads');

    const data = await fetch(
      'https://api.cloudinary.com/v1_1/dkanovye3/image/upload',
      {
        method: 'POST',
        body: formData,
      },
    ).then((r) => r.json());

    setImageUrl(data.secure_url);
    setUploadData(data);
  }

  async function handleOnSubmit(event: any) {
    event.preventDefault();

    const form = event.currentTarget;
    const fileInput = Array.from(form.elements).find(
      ({ name }) => name === 'file',
    );

    const formData = new FormData();

    for (const file of fileInput.files) {
      formData.append('file', file);
    }

    formData.append('upload_preset', 'my-uploads');

    const data = await fetch(
      'https://api.cloudinary.com/v1_1/dkanovye3/image/upload',
      {
        method: 'POST',
        body: formData,
      },
    ).then((r) => r.json());

    setImageUrl(data.secure_url);
    setUploadData(data);
  }

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div>
      <div className={styles.profileContainer}>
        <div>
          <Image
            alt="userImage"
            src={imageUrl}
            width={300}
            height={300}
            className={styles.userImage}
          />
          <p className={styles.name}>{singleUserData.username}</p>
        </div>
        <LoadImage
          handleOnChange={handleOnChange}
          handleOnSubmit={handleOnSubmit}
          imageUrl={imageUrl}
          uploadData={uploadData}
          showInput={showInput}
        />
        <form
          className={styles.form}
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="nickname">Nickname</label>
          {!showInput ? (
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
          {!showInput ? (
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
          <p className={styles.interestsTitle}>Interests</p>
          {!showInput ? (
            <Creatable
              className={styles.select}
              closeMenuOnSelect={false}
              components={categoriesOption}
              onChange={setSelectedOption}
              defaultValue={selectedOption}
              isMulti
              options={categoriesOption}
            />
          ) : (
            userCategories.map((category) => {
              return (
                <p
                  key={`category-${category.id}`}
                  className={styles.categoriesTitle}
                >
                  {category.label}
                </p>
              );
            })
          )}

          {!showInput ? (
            <button
              className={styles.buttonCreate}
              onClick={async () => {
                await save({
                  setSelectedOption,
                  setUserCategories,
                  setImageUrl,
                  setShowInput,
                  setIsLoading,
                  imageUrl,
                  idSelectedCategories,
                  userId,
                  nickname,
                  description,
                });
              }}
            >
              {isLoading ? (
                <div className={styles.spinner}>
                  <p className={styles.loader}>Loading...</p>
                </div>
              ) : (
                <p>Save</p>
              )}
            </button>
          ) : (
            <button
              className={styles.buttonEdit}
              onClick={() => setShowInput(false)}
            >
              Edit
            </button>
          )}
        </form>
      </div>
      <Link className={styles.link} href="/list">
        Go to list...
      </Link>

      <div className={styles.container}>
        <ul className={styles.responsiveTable}>
          <li className={styles.tableHeader}>
            <div className={`${styles.col} ${styles.col1} ${styles.bold}`}>
              Image
            </div>
            <div className={`${styles.col} ${styles.col2} ${styles.bold}`}>
              Username
            </div>
            <div className={`${styles.col} ${styles.col3} ${styles.bold}`}>
              Nackname
            </div>
            <div className={`${styles.col} ${styles.col4} ${styles.bold}`}>
              Description
            </div>
            <div className={`${styles.col} ${styles.col5} ${styles.bold}`}>
              Interests
            </div>
            {/* <div className={`${styles.col} ${styles.col5} ${styles.bold}`}>
              Common interests
            </div>
            <div className={`${styles.col} ${styles.col5} ${styles.bold}`}>
              Percentage
            </div> */}
            <div className={`${styles.col} ${styles.col5} ${styles.bold}`}>
              Delete
            </div>
          </li>
          {userContactsProps.map((followedUser) => {
            return (
              <div key={`user-${followedUser.id}`}>
                <li className={styles.tableRow}>
                  <div
                    className={`${styles.col} ${styles.col1}`}
                    data-label="Image"
                  >
                    <div className={styles.categoriesContainer}>
                      <Image
                        alt="userImage"
                        src={followedUser.imageUrl}
                        width={100}
                        height={100}
                        className={styles.profileImg}
                      />
                    </div>
                  </div>
                  <div
                    className={`${styles.col} ${styles.col2}`}
                    data-label="Username"
                  >
                    <div className={styles.categoriesContainer}>
                      <Link href="/chat">{followedUser.username}</Link>
                    </div>
                  </div>
                  <div
                    className={`${styles.col} ${styles.col3}`}
                    data-label="Nickname"
                  >
                    <div className={styles.categoriesContainer}>
                      {!followedUser.nickname ? (
                        <p> - </p>
                      ) : (
                        followedUser.nickname
                      )}
                    </div>
                  </div>
                  <div
                    className={`${styles.col} ${styles.col4}`}
                    data-label="Description"
                  >
                    <div className={styles.categoriesContainer}>
                      {!followedUser.description ? (
                        <p> - </p>
                      ) : (
                        followedUser.description
                      )}
                    </div>
                  </div>
                  <div
                    className={`${styles.col} ${styles.col5}`}
                    data-label="Interests"
                  >
                    <div className={styles.categoriesContainer}>
                      {followedUser.categories &&
                      followedUser.categories.length > 0 ? (
                        followedUser.categories.map((category) => {
                          return category ? <p>{category.name}</p> : null;
                        })
                      ) : (
                        <p>-</p>
                      )}
                    </div>
                  </div>
                  {/* <div
                    className={`${styles.col} ${styles.col5}`}
                    data-label="Common interests"
                  >
                    <div className={styles.categoriesContainer}>
                      {user.commonCategories &&
                      user.commonCategories.length > 0 ? (
                        user.commonCategories.map((category) => {
                          return category ? <p>{category.name}</p> : null;
                        })
                      ) : (
                        <p>-</p>
                      )}
                    </div>
                  </div> */}
                  {/* <div
                    className={`${styles.col} ${styles.col5}`}
                    data-label="Percentage"
                  >
                    <div className={styles.categoriesContainer}>
                      {user.commonInterestsInPercentage ? (
                        <p>
                          {Math.floor(
                            Math.round(user.commonInterestsInPercentage),
                          )}{' '}
                          %
                        </p>
                      ) : (
                        <p>-</p>
                      )}
                    </div>
                  </div> */}
                  <div
                    className={`${styles.col} ${styles.col2} ${styles.addContainer}`}
                    data-label="Delete"
                  >
                    <div>
                      <button
                        onClick={async () => {
                          await remove({
                            contactId: followedUser.userId,
                            setIsLoadingRemove,
                          });
                        }}
                        className={styles.buttonDelete}
                      >
                        {isLoadingRemove === followedUser.id ? (
                          <div className={styles.spinner2}>
                            <p className={styles.loader2}>Loading...</p>
                          </div>
                        ) : (
                          <CiCircleRemove />
                        )}

                        {/* <CiCircleRemove /> */}
                      </button>
                    </div>
                  </div>
                </li>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
