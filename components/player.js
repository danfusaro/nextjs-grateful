import styles from "./player.module.css";
import classNames from 'classnames';
import { formatSeconds } from "../utils/time";
import { useCallback, useEffect, useRef, useState } from "react";

const Player = (props) => {
    const { tracks: { sets = [] } } = props;
    const [current, setCurrent] = useState();

    const playerRef = useRef();

    useEffect(() => {
        if (current && playerRef.current) {
            const { current: player } = playerRef;
            player.src = current.mp3_url;
            player.pause();
            player.load();
            player.play();
        }
    }, [current, playerRef])
    return (
        <div className={styles.container}>
            <div className={styles.tracks}>
                {sets.map((set, index) => (
                    <ol key={index}>
                        {set.tracks.map((track) => (
                            <li className={classNames(styles.track, { [styles.active]: current === track })} key={track.uuid}>
                                <span onClick={() => setCurrent(track)}>
                                    {track.title} {formatSeconds(track.duration)}
                                </span>
                            </li>
                        ))}
                    </ol>
                ))}
            </div>
            <audio className={styles.audio} controls ref={playerRef} />
        </div>
    );
};

export default Player;
