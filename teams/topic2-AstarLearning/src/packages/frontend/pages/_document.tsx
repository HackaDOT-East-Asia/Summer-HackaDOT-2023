import Document, { DocumentContext, DocumentInitialProps } from 'next/document'

/**
 * MyDocument Component
 */
class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)
    return initialProps
  }
}

export default MyDocument