'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from 'next/image';

interface OTPModalProps {
  email: string;
  otp: string;
  onClose: () => void;
  onVerify: (enteredOtp: string) => Promise<void>;
}

const OTPModal: React.FC<OTPModalProps> = ({ email, otp, onClose, onVerify }) => {
  const [inputOtp, setInputOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60 * 1000); // 15 minutes in milliseconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (isExpired) {
      setError("OTP expired. Please request a new OTP.");
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, enteredOtp: inputOtp }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await onVerify(inputOtp); // Call parent function if verification is successful
      } else {
        setError(data.error || "Verification failed.");
      }
    } catch (err) {
      setError("Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent className="shad-alert-dialog w-[min(100%,calc(100vw-2rem))] max-w-[28rem] px-4 py-5 sm:px-6 sm:py-6">
        <AlertDialogHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <AlertDialogTitle className="text-xl font-semibold leading-tight sm:text-2xl">
              OTP Verification
            </AlertDialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dark-500 bg-dark-300 text-muted-foreground transition hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close OTP modal"
            >
              <Image
                src="/assets/icons/close.svg"
                alt="Close"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </button>
          </div>
          <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
            Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="text-center text-red-500 font-medium">
          {isExpired ? "OTP expired. Login again to verify." : `OTP expires in: ${formatTime(timeLeft)}`}
        </div>

        <div className="flex flex-col gap-4">
          <InputOTP maxLength={6} value={inputOtp} onChange={setInputOtp} disabled={isExpired}>
            <InputOTPGroup className="shad-otp">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot className="shad-otp-slot" key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="shad-error text-14-regular mt-2 text-center text-red-500">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter className="flex flex-col gap-3">
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className={`w-full rounded-lg py-3 text-base font-semibold transition duration-150 transform active:scale-95 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-500 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
                  ></path>
                </svg>
                Verifying...
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
