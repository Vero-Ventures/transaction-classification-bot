'use client';
import { useState } from 'react';

export function ConfidenceBar({
  barOne,
  barTwo,
  barThree,
  hoverText,
}: {
  barOne: string;
  barTwo: string;
  barThree: string;
  hoverText: string;
}) {
  return (
    <div className="relative flex w-fit border-2 mx-2 border-blue-300 rounded-lg ">
      <div className={barOne}></div>
      <div className={barTwo}></div>
      <div className={barThree}></div>
      <div className="opacity-0 hover:opacity-100 duration-300 absolute w-32 inset-0 flex justify-center -translate-x-1">
        <div className="bg-gray-400 bg-opacity-90 h-fit text-sm text-center rounded-lg p-1 -translate-y-2">
          {hoverText}
        </div>
      </div>
    </div>
  );
}
