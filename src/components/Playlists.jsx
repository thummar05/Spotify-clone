import axios from "axios";
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";
import { accessToken } from "./AccessToken";

export default function Playlists({ showSearch }) {
  const [{ token, playlists }, dispatch] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const timeout = setTimeout(() => {
      setFadeIn(false);
    }, 500);  

    return () => clearTimeout(timeout);
  }, [searchResults, playlists]);

  useEffect(() => {
    const getPlaylistData = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists/",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      const { items } = response.data;
      const playlists = items.map(({ name, id }) => {
        return { name, id };
      });
      dispatch({ type: reducerCases.SET_PLAYLISTS, playlists });
    };

    getPlaylistData();
  }, [token, dispatch]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim() !== "") {
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${searchQuery}&type=playlist`,
          {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        setSearchResults(response.data.playlists.items);
      } else {
        setSearchResults([]);
      }
    };

    search();
  }, [searchQuery]);

  const changeCurrentPlaylist = (selectedPlaylistId) => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId });
  };

  return (
    <Container>
      <SearchInputContainer showSearch={showSearch}>
        <SearchInput
          type="text"
          placeholder="Search playlists"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          showSearch={showSearch}
        />
        <SearchLine showSearch={showSearch} />
      </SearchInputContainer>
      <ul>
        {searchQuery.trim() !== ""
          ? searchResults.map(({ name, id }) => (
              <li
                key={id}
                onClick={() => changeCurrentPlaylist(id)}
                className={fadeIn ? "fade-in" : ""}
              >
                {name}
              </li>
            ))
          : playlists.map(({ name, id }) => (
              <li
                key={id}
                onClick={() => changeCurrentPlaylist(id)}
                className={fadeIn ? "fade-in" : ""}
              >
                {name}
              </li>
            ))}
      </ul>
    </Container>
  );
}

const Container = styled.div`
  color: #b3b3b3;
  height: 100%;
  overflow: hidden;

  .fade-in {
    animation: fadeInAnimation 0.5s ease-in-out;
  }
  
  @keyframes fadeInAnimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    height: 55vh;
    max-height: 100%;
    overflow: auto;
    cursor: pointer;

    &::-webkit-scrollbar {
      width: 0.7rem;

      &-thumb {
        background-color: rgba(255, 255, 255, 0.6);
      }
    }
  }
`;

const fadeIn = css`
  opacity: 1;
  visibility: visible;
  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
`;

const SearchInputContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  width: 85%;
  margin-left: 20px;
  border: 1px solid #b3b3b3;
  border-radius: 20px;
  outline: none;
  ${(props) => (props.showSearch ? fadeIn : "opacity: 0; visibility: hidden;")}
  &::placeholder {
    color: #b3b3b3;
  }
`;

const SearchLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 20px;
  width: 85%;
  height: 1px;
  background-color: #cfc8d3;
  transform-origin: bottom right;
  transform: scaleX(0);
  transition: transform 0.5s ease-in-out;
  ${(props) => (props.showSearch ? "transform: scaleX(1);" : "")}
`;
