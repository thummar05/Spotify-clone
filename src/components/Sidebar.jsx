import React, { useState } from "react";
import styled from "styled-components";
import { MdHomeFilled, MdSearch } from "react-icons/md";
import { IoLibrary } from "react-icons/io5";
import Playlists from "./Playlists";
import axios from "axios"; 
import { accessToken } from "./AccessToken";

export default function Sidebar() {
  const [showSearch, setShowSearch] = useState(false);
  const [yourLibraryPlaylists, setYourLibraryPlaylists] = useState([]);

  const handleSearchClick = () => {
    setShowSearch(!showSearch);
  };
  const handleYourLibraryClick = async () => {
    try {
      // Make an API request to get the user's playlists
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists/",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );

      // Extract the playlists from the response
      const playlists = response.data.items.map(({ name, id }) => {
        return { name, id };
      });

      // Pass the playlists to the Playlists component
      setShowSearch(false); 
      setYourLibraryPlaylists(playlists);
      // Hide search when navigating to the library
      // Pass the playlists data to the Playlists component
      // Assuming Playlists component takes a playlists prop
      setYourLibraryPlaylists(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error.message);
    }
  };
  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png"
            alt="spotify"
          />
        </div>
        <ul>
          <li>
            <MdHomeFilled />
            <span>Home</span>
          </li>
          <li onClick={handleSearchClick}>
            <MdSearch />
            <span>Search</span>
          </li>
          <li onClick={handleYourLibraryClick}>
            <IoLibrary />
            <span>Your Library</span>
          </li>
        </ul>
      </div>
      <Playlists showSearch={showSearch} yourLibraryPlaylists={yourLibraryPlaylists}/>
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
      text-align: center;
      margin: 1rem 0;
      img {
        max-inline-size: 80%;
        block-size: auto;
      }
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: white;
        }
      }
    }
  }
`;
