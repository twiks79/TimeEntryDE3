import * as css from "../css";
import useSession from "../utils/useSession";
import { defaultSession } from "../utils/lib";

export function Form() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <p className="text-lg">Loading...</p>;
  }

  if (session.isLoggedIn) {
    return (
      <>
        <p className="text-lg">
          Logged in user: <strong>{session.username}</strong>
        </p>
        <LogoutButton />
      </>
    );
  }

  return <LoginForm />;
}

function LoginForm() {
  const { login } = useSession();

  return (
    <form
      onSubmit={function (event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get("username");
        login(username, {
          optimisticData: {
            isLoggedIn: true,
            username,
          },
        });
      }}
      method="POST"
      className={css.form}
    >
      <label className="block text-lg">
        <span className={css.label}>Username</span>
        <input
          type="text"
          name="username"
          className={css.input}
          placeholder=""
          defaultValue="Alison"
          required
          autoComplete="off"
          data-1p-ignore="true"
        />
      </label>
      <div>
        <input type="submit" value="Login" className={css.button} />
      </div>
    </form>
  );
}

function LogoutButton() {
  const { logout } = useSession();

  return (
    <p>
      <button
        className={css.button}
        onClick={(event) => {
          event.preventDefault();
          logout(null, {
            optimisticData: defaultSession,
          });
        }}
      >
        Logout
      </button>
    </p>
  );
}