import axios from "axios";
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";
import { accessToken } from "./AccessToken";
import { AiFillClockCircle } from "react-icons/ai";

 

export default function Body() {
  const [{ token, selectedPlaylist, selectedPlaylistId }, dispatch] =
    useStateProvider();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const timeout = setTimeout(() => {
      setFadeIn(false);
    }, 1000);  

    return () => clearTimeout(timeout);
  }, [selectedPlaylist]);

    useEffect(() => {
      const getInitialPlaylist = async () => {
        try {
          const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${selectedPlaylistId}`,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          );
    
          const playlist = response.data;
    
          const selectedPlaylist = {
            id: playlist.id,
            name: playlist.name,
            description: playlist.description.startsWith("<a>") ? "" : playlist.description,
            image: playlist.images[0].url,
            tracks: playlist.tracks.items.map(({ track }) => ({
              id: track.id,
              name: track.name,
              artists: track.artists.map((artist) => artist.name),
              image: track.album.images[2].url,
              duration: track.duration_ms,
              album: track.album.name,
              context_uri: track.album.uri,
              track_number: track.track_number,
            })),
          };
    
          dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist });
        } catch (error) {
          console.error("Error fetching playlist:", error.message);
        }
      };
    
      getInitialPlaylist();
    }, [token, dispatch, selectedPlaylistId]);

    
    
    
  const playTrack = async (
    id,
    name,
    artists,
    image,
    context_uri,
    track_number
  ) => {
    const response = await axios.put(
      `https://api.spotify.com/v1/me/player/play`,
      {
        context_uri,
        offset: {
          position: track_number - 1,
        },
        position_ms: 0,
      },
      {
        headers: {
           
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    if (response.status === 204) {

      setFadeIn(true);
      const timeout = setTimeout(() => {
        setFadeIn(false);
      }, 500);
      
      const currentPlaying = {
        id,
        name,
        artists,
        image,
      };
      dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
      return () => clearTimeout(timeout);
    } else {
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    }
  };
  const msToMinutesAndSeconds = (ms) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };
  return (
    <Container fadeIn={fadeIn}>
      {selectedPlaylist && (
        <>
          <div className="playlist">
            <div className="image">
              <img src={selectedPlaylist.image} alt="selected playlist" />
            </div>
            <div className="details">
              <span className="type">PLAYLIST</span>
              <h1 className="title">{selectedPlaylist.name}</h1>
              <p className="description">{selectedPlaylist.description}</p>
            </div>
          </div>
          <div className="list">
            <div className="header-row">
              <div className="col">
                <span>#</span>
              </div>
              <div className="col">
                <span>TITLE</span>
              </div>
              <div className="col">
                <span>ALBUM</span>
              </div>
              <div className="col">
                <span>
                  <AiFillClockCircle />
                </span>
              </div>
            </div>
            <div className="tracks">
              {selectedPlaylist.tracks.map(
                (
                  {
                    id,
                    name,
                    artists,
                    image,
                    duration,
                    album,
                    context_uri,
                    track_number,
                  },
                  index
                ) => {
                  return (
                    <div
                      className="row"
                      key={id}
                      onClick={() =>
                        playTrack(
                          id,
                          name,
                          artists,
                          image,
                          context_uri,
                          track_number
                        )
                      }
                    >
                      <div className="col">
                        <span>{index + 1}</span>
                      </div>
                      <div className="col detail">
                        <div className="image">
                          <img src={image} alt="track" />
                        </div>
                        <div className="info">
                          <span className="name">{name}</span>
                          <span>{artists.join(', ')}</span>
                        </div>
                      </div>
                      <div className="col">
                        <span>{album}</span>
                      </div>
                      <div className="col">
                        <span>{msToMinutesAndSeconds(duration)}</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
${(props) =>
  props.fadeIn &&
  css`
    animation: fadeInAnimation 0.5s ease-in-out;
  `}

@keyframes fadeInAnimation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
  .playlist {
    margin: 0 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    .image {
      img {
        height: 15rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
      }
    }
    .details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #e0dede;
      .title {
        color: white;
        font-size: 4rem;
      }
    }
  }
  .list {
    .header-row {
      display: grid;
      grid-template-columns: 0.3fr 3fr 2fr 0.1fr;
      margin: 1rem 0 0 0;
      color: #dddcdc;
      top: 15vh;
      padding: 1rem 3rem;
      transition: 0.3s ease-in-out;
    }
    .tracks {
      margin: 0 2rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 5rem;
    
      .row {
        padding: 0.5rem 1rem;
        display: grid;
        grid-template-columns: 0.3fr 3.1fr 2fr 0.1fr;
        cursor: pointer;
        -webkit-transition: background-color 0.5s ease-out;
        -moz-transition: background-color 0.5s ease-out;
        -o-transition: background-color 0.5s ease-out;
        transition: background-color 0.5s ease-out; 
    
        &:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
    
        .col {
          display: flex;
          align-items: center;
          color: #dddcdc;
    
          img {
            height: 40px;
            width: 40px;
          }
        }
    
        .detail {
          display: flex;
          gap: 1rem;
    
          .info {
            display: flex;
            flex-direction: column;
    
            .name {
              font-weight: 600;
              color: white;
            }
          }
        }
      }
    }
    
        .detail {
          display: flex;
          gap: 1rem;
          .info {
            display: flex;
            flex-direction: column;
            .name{
              font-weight: 600;
              color: white;
            }
          }
        }
      }
    }
  }
`;
