import Link from "next/link";
import * as css from "../css";

import { Form } from "../components/form";

import Head from "next/head";

export default function AppRouterSWR() {
  return (
    <main className="p-10 space-y-5">
      <Head>
        <div>
          🛠 iron-session examples: Pages Router, API routes, and SWR
        </div>
      </Head>
      <div
        subtitle={
          <>
            + API routes, and{" "}
            <a
              className={css.Link}
              href="https://swr.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              SWR
            </a>
          </>
        }
      />

      <p className="italic max-w-xl">
        <u>How to test</u>: Login and refresh the page to see iron-session in
        action. Bonus: open multiple tabs to see the state being reflected by
        SWR automatically.
      </p>

      <div className="grid grid-cols-1 gap-4 p-10 border border-slate-500 rounded-md max-w-xl">
        <Form />
        <div className="space-y-2">
          <hr />
          <p>
            The following pages are protected and will redirect back here if
            you&apos;re not logged in:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <Link 
                href="/pages-router-api-route-swr/protected-client"
                passHref
              >
                Protected page via client call →
              </Link>
            </li>
            <li>
              <Link 
                href="/pages-router-api-route-swr/protected-server"
                passHref
              >
                Protected page via getServerSideProps →
              </Link>{" "}
            </li>
            <li>
              <Link 
                href="/pages-router-api-route-swr/protected-middleware"
                passHref
              >
                Protected page via middleware →
              </Link>{" "}
            </li>
          </ul>
        </div>
      </div>

      <div> pages/pages-router-api-route-swr </div>
      <HowItWorks />

      <p>
        <Link  href="/" passHref>
          ← All examples
        </Link>
      </p>
    </main>
  );
}

function HowItWorks() {
  return (
    <details className="max-w-2xl space-y-4">
      <summary className="cursor-pointer">How it works</summary>

      <ol className="list-decimal list-inside">
        <li>
          During login, the form is submitted with SWR&apos;s{" "}
          <a
            href="https://swr.vercel.app/docs/mutation#useswrmutation"
            className={css.Link}
          >
            useSWRMutation
          </a>
          . This makes a POST /session request using fetch.
        </li>
        <li>
          During logout, the form is submitted with SWR&apos;s{" "}
          <a
            href="https://swr.vercel.app/docs/mutation#useswrmutation"
            className={css.Link}
          >
            useSWRMutation
          </a>
          . This makes a DELETE /session request using fetch.
        </li>
        <li>
          In all other places, the content of the session is optimistically
          rendered using the most recent value, and never gets outdated. This is
          automatically handled by SWR using mutations and revalidation.
        </li>
      </ol>
    </details>
  );
}