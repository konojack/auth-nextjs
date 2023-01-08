import { useRef } from 'react';
import classes from './profile-form.module.css';

function ProfileForm() {
  const newPasswordInput = useRef();
  const oldPasswordInput = useRef();

  async function handleSubmitForm(e) {
    e.preventDefault();
    const response = await fetch('/api/user/change-password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: oldPasswordInput.current.value,
        newPassword: newPasswordInput.current.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <form className={classes.form} onSubmit={handleSubmitForm}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input type="password" id="new-password" ref={newPasswordInput} />
      </div>
      <div className={classes.control}>
        <label htmlFor="old-password">Old Password</label>
        <input type="password" id="old-password" ref={oldPasswordInput} />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
}

export default ProfileForm;
