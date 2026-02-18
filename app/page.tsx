//app/page.tsx

"use client";

import CPARLogo, { FileLogoMark, GlobeLogoMark } from "../components/logo";
import Tooltip from "../components/tool-tip";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { homeStyles } from "@/constants/styles";

export default function Home() {
  return (
    <div className={homeStyles.page}>
      <main className={homeStyles.main}>
        <CPARLogo />

        <div className={homeStyles.hero}>
          <h1 className={homeStyles.heroTitle}>To get started,</h1>

          <p className={homeStyles.heroText}>
            please{" "}
            <Tooltip
              content={
                <span>
                  your verified email address and a password are required to
                  login.
                </span>
              }
              delay={100}
              placement="bottom"
            >
              <Link href={ROUTES.AUTH.LOGIN} className={homeStyles.heroLink}>
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
              <Link href={ROUTES.AUTH.REGISTER} className={homeStyles.heroLink}>
                Register
              </Link>
            </Tooltip>{" "}
          </p>
        </div>

        <div className={homeStyles.footer}>
          <Tooltip
            content={
              <span>
                ron@cparl.com; +1 613 410-8880; 66 Riverstone Dr, Nepean ON
              </span>
            }
            delay={100} /*ms*/
            placement="bottom"
          >
            <Link href="/users" className={homeStyles.footerLink}>
              <span className={homeStyles.footerLinkContent}>
                <GlobeLogoMark />
                Contact Us
              </span>
            </Link>
          </Tooltip>

          <Tooltip
            content={<span>including Privacy Policy...</span>}
            delay={100} /*ms*/
            placement="bottom"
          >
            <Link href="/users" className={homeStyles.footerLink}>
              <span className={homeStyles.footerLinkContentAlt}>
                <FileLogoMark />
                Terms & Conditions
              </span>
            </Link>
          </Tooltip>

          <p className={homeStyles.footerCopyright}>
            Copyright © 2026 CPARL Inc. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
