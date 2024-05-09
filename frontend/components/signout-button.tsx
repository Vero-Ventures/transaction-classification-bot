"use client";

import { signOut } from 'next-auth/react';

const SignOutButton = () => {
    return (
        <button className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded transition-colors duration-150" onClick={() => signOut()}>
            Sign Out
        </button>
    );
};

export default SignOutButton;
