import { NextPage, NextPageContext } from 'next'
import Error from 'next/error'
interface Props {
  statusCode?: number
}

/**
 * ErrorPage Component
 * @param param0 
 * @returns 
 */
const ErrorPage: NextPage<Props> = ({ statusCode }) => {
  return statusCode ? (
    <Error statusCode={statusCode}></Error>
  ) : (
    <p>An error occurred on client</p>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage