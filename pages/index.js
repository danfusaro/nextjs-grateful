import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { getYears } from '../lib/api'
import { ratingToColor } from '../utils/color'

export default function Home({ years }) {
  return (
    <Layout home>
      <Head>
        <title>Grateful Dead Show Explorer - Select a year</title>
      </Head>
      {/* Keep the existing code here */}
      {/* Add this <section> tag below the existing <section> tag */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Select a year:</h2>
        <ul className={utilStyles.horizList}>
          {years.map(({ year, show_count, uuid, avg_rating }) => (
            <li className={utilStyles.horizListItem} key={uuid}>
              <Link href={`/years/${year}`}>
                <a>{year}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                {show_count} show{show_count > 1 && 's'}
              </small>
              <br />
              <small className={utilStyles.lightText}>
                Average Rating: <span style={{ color: ratingToColor(avg_rating) }}>{Math.round(avg_rating)} / 10</span>
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const years = await getYears()
  return {
    props: {
      years
    }
  }
}