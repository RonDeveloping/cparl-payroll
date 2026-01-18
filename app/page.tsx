import Image from "next/image";
import Tooltip from "../components/Tooltip";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/logo.png"
          alt="CPAL"
          width={88}
          height={88}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started,
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            please{" "}
            <Tooltip
              content={
                <span>
                  your registered email address and password are required to
                  login.
                </span>
              }
              delay={100}
              placement="bottom"
            >
              <Link
                href="/contacts/new"
                className="font-medium text-zinc-950 dark:text-zinc-50"
              >
                Login
              </Link>
            </Tooltip>{" "}
            or{" "}
            <Tooltip
              content={
                <span>a unique email address is the minimum requirement.</span>
              }
              delay={100} /*ms*/
              placement="bottom"
            >
              <Link
                href="/users"
                className="font-medium text-zinc-950 dark:text-zinc-50"
              >
                Register
              </Link>
            </Tooltip>{" "}
          </p>
        </div>

        <div className="flex w-full items-center flex-col gap-4 text-base font-medium sm:flex-row">
          <Tooltip
            content={
              <span>
                ron@cparl.com; +1 613 410-8880; 66 Riverstone Dr, Nepean ON
              </span>
            }
            delay={100} /*ms*/
            placement="bottom"
          >
            <Link
              href="/users"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              <span className="flex items-center gap-2 font-medium whitespace-nowrap">
                <Image
                  className="dark:invert"
                  src="/globe.svg"
                  alt="Globe logomark"
                  width={16}
                  height={16}
                />
                Contact Us
              </span>
            </Link>
          </Tooltip>

          <Tooltip
            content={<span>including Privacy Policy...</span>}
            delay={100} /*ms*/
            placement="bottom"
          >
            <Link
              href="/users"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              <span className="flex items-center gap-2 font-medium text-zinc-950 dark:text-zinc-50 whitespace-nowrap">
                <Image
                  className="dark:invert"
                  src="/file.svg"
                  alt="Globe logomark"
                  width={16}
                  height={16}
                />
                Terms & Conditions
              </span>
            </Link>
          </Tooltip>

          <p className="ml-auto flex items-center text-[13px] leading-none text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            Copyright © 2026 CPARL Inc. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
