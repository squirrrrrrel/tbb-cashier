import React from "react";

const LoginPage = () => {
  return (
    <div className="login bg-gradient-to-b from-primary to-secondary min-h-screen flex items-center justify-center">
      <div className="card bg-white shadow-lg py-16 px-20 text-primary">
        <h1 className="text-3xl font-semibold mb-10 text-center">
          Welcome to Warnoc POS!
        </h1>
        <form className="flex flex-col gap-2 justify-center items-center font-semibold">
          <div className="username flex flex-col">
            <label className="text-sm text-center">Username or Email</label>
            <input
              type="text"
              autoFocus
              className="border border-primary p-2 rounded-sm text-black w-70 outline-none text-center"
            />
          </div>
          <div className="password flex flex-col">
            <label className="text-sm text-center">Password</label>
            <input
              type="password"
              className="border border-primary p-2 rounded-sm text-black w-70 outline-none text-center"
            />
          </div>
          <div className="forget underline">Forget Password</div>
          <button
            type="submit"
            className="bg-primary hover:bg-secondary hover:cursor-pointer text-white p-2 rounded transition w-70"
          >
            Log In
          </button>
        </form>
        <div className="text-center mt-4 text-lg font-medium">
          Thanks for using Warnoc!
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
