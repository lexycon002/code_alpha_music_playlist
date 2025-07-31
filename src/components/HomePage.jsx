import React, { useEffect, useState } from "react";
import axios from "axios";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoPauseSharp } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import myImage from "../assets/myImage.jpg";
import banner1 from "../assets/banner1.jpg"
import banner2 from "../assets/banner2.jpg"
import banner3 from "../assets/banner3.jpg"
import banner4 from "../assets/banner4.jpg"
import RecentlyPlayed from "./RecentlyPlayed";


// Banner images for the rotating background
const bannerImages = [banner1, banner2, banner3, banner4];
const artistNames = [ "Brymo", "Asake","Ayra Starr","Wizkid","Tems","Burna Boy","Rema","Davido","Akon","Mayorkun","Olamide", "Simi"];



const HomePage = () => {
  const [topArtists, setTopArtists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedArtistTracks, setSelectedArtistTracks] = useState([]);

  // Rotating banner background effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchArtists = async () => {
      const results = [];

      for (const name of artistNames) {
        try {
          const res = await axios.get(
            `https://corsproxy.io/?https://api.deezer.com/search/artist?q=${name}`
          );

          if (res.data.data && res.data.data.length > 0) {
            const artist = res.data.data[0];
            results.push({
              id: artist.id,
              name: artist.name,
              image: artist.picture_medium,
            });
          }
        } catch (err) {
          console.error(`Error fetching artist ${name}:`, err);
        }
      }

      setTopArtists(results);
    };

    fetchArtists();
  }, []);

    // Keep play/pause icon in sync with actual audio state
  useEffect(() => {
    const handlePlay = (e) => {
      setPlayingTrackId(String(e.target.dataset.trackid));
    };
    const handlePause = (e) => {
      // Only clear if the paused audio is the one currently playing
      if (playingTrackId === String(e.target.dataset.trackid)) {
        setPlayingTrackId(null);
      }
    };
    // Attach listeners to all audio elements
    const audios = document.querySelectorAll('audio[data-trackid]');
    audios.forEach(audio => {
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handlePause);
    });
    return () => {
      audios.forEach(audio => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handlePause);
      });
    };
  }, [recentTracks, playingTrackId]);

  const fetchNigerianSongs = async () => {
    let allTracks = [];
    for (const name of artistNames) {
      try {
        const res = await axios.get(
          `https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(name)}`
        );
        if (res.data.data && res.data.data.length > 0) {
          // Optionally, filter to only include tracks where artist name matches exactly
          const filtered = res.data.data.filter(track => track.artist.name.toLowerCase() === name.toLowerCase());
          allTracks = allTracks.concat(filtered.slice(0, 6)); // Get top 6 songs per artist
        }
      } catch (err) {
        console.error(`Error fetching songs for artist ${name}:`, err);
      }
    }
    setRecentTracks(allTracks);
  };

  // Fetch songs for a specific artist and show RecentlyPlayed view
  const handleArtistClick = async (artist) => {
    setSelectedArtist(artist);
    setSelectedArtistTracks([]); // Clear previous
    try {
      const res = await axios.get(
        `https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(artist.name)}`
      );
      if (res.data.data && res.data.data.length > 0) {
        // Filter to only include tracks where artist name matches exactly
        const filtered = res.data.data.filter(track => track.artist.name.toLowerCase() === artist.name.toLowerCase());
        setSelectedArtistTracks(filtered.slice(0, 10)); // Show up to 10 songs
      }
    } catch (err) {
      console.error(`Error fetching songs for artist ${artist.name}:`, err);
    }
  };

  const handleBackToHome = () => {
    setSelectedArtist(null);
    setSelectedArtistTracks([]);
  };


  // Only show RecentlyPlayed full screen if an artist is selected
  if (selectedArtist) {
    return (
      <div className="recently-played-container">
        <RecentlyPlayed onBack={handleBackToHome}
          tracks={selectedArtistTracks.map(track => ({
            image: track.album.cover_medium,
            artist: track.artist.name,
            title: track.title,
            preview: track.preview
          }))}
          artist={selectedArtist.name}
        />
      </div>
    );
  }

  // Otherwise show homepage
  return (
    <div className="homepage-container">
      <div className="homepage-container-wrapper">
        <div className="homepage-wrapper">
          <div className="home-icon-wrap">
            <span><TfiHeadphoneAlt /></span>
            <span><h5>Ollylist</h5></span>
          </div>
          <div className="home-profile">
            <span><IoMdNotificationsOutline /></span>
            <span> <img src={myImage} alt="my-image" /></span>
          </div>
        </div>

        <h1 className="top-artist-heading">Top Artists</h1>
        <div className="top-artist">
          {topArtists.map((artist) => (
            <div
              className="artist-image-container"
              key={artist.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleArtistClick(artist)}
            >
              <img className="artist-image" src={artist.image} alt={artist.name} />
              <p>{artist.name}</p>
            </div>
          ))}
        </div>

        <h1 className="top-artist-heading">New Album</h1>
        <div className="new-album-container">
          {bannerImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'absolute',
                inset: 0,
                borderRadius: '10px',
                opacity: bannerIndex === idx ? 1 : 0,
                transition: 'opacity 0.7s ease',
                zIndex: 1
              }}
            />
          ))}
        </div>
        <button className="play-btn" onClick={fetchNigerianSongs}>Load my music</button>

        <h1 className="top-artist-heading">Recently Played</h1>
        <div className="tracklist-container">
          {recentTracks.map((track, idx) => {
            const audioId = `audio-${track.id}`;
            const isPlaying = playingTrackId === String(track.id);

            const handlePlay = () => {
              // Pause all other audios
              document.querySelectorAll('audio').forEach((audio) => {
                if (audio.id !== audioId) audio.pause();
              });
              const audio = document.getElementById(audioId);
              if (audio) {
                audio.play();
                // Do NOT setPlayingTrackId here; let the event listener handle it
              }
            };
            const handlePause = () => {
              const audio = document.getElementById(audioId);
              if (audio) {
                audio.pause();
                // Do NOT setPlayingTrackId here; let the event listener handle it
              }
            };

            return (
              <div key={track.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    className="tracklist-img"
                    src={track.album.cover_medium}
                    alt={track.title}
                  />
                  <div
                    className="play-control"
                    onClick={isPlaying ? handlePause : handlePlay}
                  >
                    {isPlaying ? <IoPauseSharp /> : <FaPlay />}
                  </div>
                </div>
                <p className="tracklist-title">
                  {track.title.length > 16 ? track.title.slice(0, 10) + '...' : track.title}
                </p>
                <p className="tracklist-name">{track.artist.name}</p>
                <audio id={audioId} data-trackid={track.id} className="playlist-control" controls src={track.preview} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
