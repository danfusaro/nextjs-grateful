// import Date from '../../components/date'
import Layout from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import Head from 'next/head'
import { getYear, getShow } from '../../lib/api'

import Map from '../../components/showsMap'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ratingToColor } from '../../utils/color'
import Link from 'next/link'
import Player from '../../components/player'
import { formatDate, formatSeconds } from '../../utils/time'

export default function Years({ year, day }) {

    const { tracks, date, venue, id } = Object(day);

    const onShowPinClick = useCallback((show) => {
        setZoomShow({ show, scroll: true });
    });

    const [zoomShow, setZoomShow] = useState({});
    const listRef = useRef();

    useEffect(() => {
        // Scroll to show
        if (zoomShow && zoomShow.scroll) {
            const el = document.getElementById(zoomShow.show.id);
            listRef.current.scrollTop = el.offsetTop - listRef.current.offsetTop;
        }
    }, [zoomShow, listRef])

    useEffect(() => {
        if (id) {
            const show = year.shows.find(x => id === x.id);
            if (show) {
                setZoomShow({ show, scroll: true });
            }
        }
    }, [id])

    // TODO no inline styles, not so much binding, make less gross
    return (
        <Layout>
            <Head>
                <title>Grateful Dead Shows - {year.year}</title>
            </Head>
            <h1 className={utilStyles.headingXl}>{year.year} ({year.show_count} US shows)</h1>
            <div style={{ display: 'flex' }}>
                <Map style={{ flex: 3 }} shows={year.shows} onShowPinClick={onShowPinClick} zoomShow={zoomShow.show} />
                <ol ref={listRef} style={{ marginLeft: '0.25rem', flex: 1, height: '600px', width: '800px', overflowY: 'auto' }}>
                    {year.shows.map(show => <li onClick={() => setZoomShow({ show, scroll: false })} key={show.uuid} id={show.id} style={{ width: '100%', background: zoomShow && show === zoomShow.show ? '#eee' : 'inherit' }}>
                        <Link href={`/years/${year.year}/${show.display_date}`}>
                            <a>{show.venue.name}</a>
                        </Link>
                        <div>{show.venue.location}</div>
                        <div>{formatDate(show.date)}</div>
                        <div style={{ color: ratingToColor(show.avg_rating) }}>Rating: {Math.round(show.avg_rating)}/10</div>
                    </li>)}
                </ol>
            </div>
            { day && <div>
                <h3>{formatDate(date)} - {venue} </h3>
                <Player tracks={tracks} />
            </div>}
        </Layout>
    )
}

export async function getServerSideProps({ params }) {
    const [year, day] = params.path;
    const yearData = await getYear(year);
    const dayData = day ? await getShow(year, day) : null;
    return {
        props: {
            year: yearData,
            day: dayData
        }
    }
}
