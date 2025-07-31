import React, { useRef, useState, useEffect } from 'react';
import { FaPlay } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";
import { CiShuffle } from "react-icons/ci";
import { PiRepeatOnceThin } from "react-icons/pi";
import { IoPauseSharp } from "react-icons/io5";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";

const RecentlyPlayed = ({ tracks = [], artist, onBack }) => {
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seekValue, setSeekValue] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const currentTrack = tracks[currentTrackIdx];

  useEffect(() => {
    setCurrentTrackIdx(0);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [tracks, artist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = (e) => {
      setPlayingTrackId(String(currentTrackIdx));
      setIsPlaying(true);
    };

    const handlePause = (e) => {
      if (playingTrackId === String(currentTrackIdx)) {
        setPlayingTrackId(null);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [currentTrackIdx, playingTrackId]);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!isSeeking && audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      const percent = (current / (total || 1)) * 100;
      setProgress(percent);
      setDuration(total);
    }
  };

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    if (isSeeking) setSeekValue(value);
  };

  const handleSliderMouseDown = () => {
    setIsSeeking(true);
    setSeekValue(progress);
    if (audioRef.current) {
      setWasPlayingBeforeSeek(!audioRef.current.paused);
      audioRef.current.pause();
    }
  };

  const handleSliderMouseUp = () => {
    setIsSeeking(false);
    const value = seekValue ?? progress;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (value / 100) * duration;
    }
    if (audioRef.current && wasPlayingBeforeSeek) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentTrackIdx > 0) {
      setCurrentTrackIdx(currentTrackIdx - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentTrackIdx < tracks.length - 1) {
      setCurrentTrackIdx(currentTrackIdx + 1);
      setIsPlaying(true);
    }
  };

  const handleTrackClick = (idx) => {
    if (idx === currentTrackIdx) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentTrackIdx(idx);

    setTimeout(() => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(true);
        }
      }
    }, 100);
  };

  return (
    <div className="recently-played-container">
      <div className="recently-played">
        <div className="recently-played-wrapper">
          <div className="recent-left-icon" style={{ cursor: "pointer" }}>
            <HiOutlineArrowCircleLeft size={30} onClick={onBack} />
          </div>
          <div className="recent-title">
            <h3>{artist || "Recently Played"}</h3>
          </div>
          <div className="recent-right-icon"><BsThreeDots /></div>
        </div>

        {currentTrack && (
          <>
            <div className="album-playing">
              <img src={currentTrack.image} alt="album" />
              <p className="album-name">{currentTrack.title}</p>
              <p className="album-artist">{currentTrack.artist}</p>
            </div>

            <audio
              ref={audioRef}
              src={currentTrack.preview}
              data-trackid={currentTrackIdx}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => setDuration(audioRef.current.duration)}
              onEnded={() => {
                if (currentTrackIdx < tracks.length - 1) {
                  setCurrentTrackIdx(currentTrackIdx + 1);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(false);
                }
              }}
            />

            <div className="slider-image-wrapper">
              <input
                type="range"
                min={0}
                max={100}
                value={isSeeking && seekValue !== null ? seekValue : progress}
                onChange={handleSliderChange}
                onMouseDown={handleSliderMouseDown}
                onMouseUp={handleSliderMouseUp}
                onTouchStart={handleSliderMouseDown}
                onTouchEnd={handleSliderMouseUp}
                className="audio-slider"
                style={{ "--progress": `${progress}%` }}
              />
            </div>

            <div className="album-time">
              <p>{formatTime((progress / 100) * duration)}</p>
              <p>{formatTime(duration)}</p>
            </div>

            <div className="music-controls">
              <div className="music-shuffle"><CiShuffle /></div>
              <div className="music-prev" onClick={handlePrev}><MdOutlineSkipPrevious /></div>
              <div className="music-pause-play" onClick={togglePlay}>
                {isPlaying ? <IoPauseSharp /> : <FaPlay />}
              </div>
              <div className="music-next" onClick={handleNext}><MdOutlineSkipNext /></div>
              <div className="music-repeat"><PiRepeatOnceThin /></div>
            </div>
          </>
        )}

        <div className="recent-artist-tracklist">
          {tracks.map((t, idx) => (
            <div
              className={`recent-artist ${idx === currentTrackIdx ? 'active' : ''}`}
              key={idx}
              onClick={() => handleTrackClick(idx)}
            >
              <div className="recent-image-container">
                <img className="recent-tracklist-img" src={t.image} alt={t.title} />
              </div>
              <div>
                <p className="tracklist-name">
                  {t.title.length > 16 ? t.title.slice(0, 10) + '...' : t.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyPlayed;
