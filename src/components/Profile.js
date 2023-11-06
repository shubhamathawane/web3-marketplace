import Navbar from "./Navbar";
import { useLocation, useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faCopy,
  faFingerprint,
} from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [address, updateAddress] = useState("0x");
  const [totalPrice, updateTotalPrice] = useState("0");

  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    let sumPrice = 0;
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    //Pull the deployed contract instance
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );

    //create an NFT Token
    let transaction = await contract.getMyNFTs();

    /*
     * Below function takes the metadata from tokenURI and the data returned by getMyNFTs() contract function
     * and creates an object of information that is to be displayed
     */

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        sumPrice += Number(price);
        return item;
      })
    );

    updateData(items);
    updateFetched(true);
    updateAddress(addr);
    updateTotalPrice(sumPrice.toPrecision(3));
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);

  return (
    <div className="border rounded-md">
      <Navbar />

      {address ? (
        <>
          <div className="flex">
            <div className="left w-full mx-20 my-10">
              <div className="container my-sm border-sm rounded">
                {data?.length > 0 ? (
                  <>
                    <h2 className="mt-5 mx-12">Your NFT's</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                      {data.map((value, index) => {
                        return <NFTTile data={value} key={index}></NFTTile>;
                      })}
                    </div>
                  </>
                ): <><h3>You Do Not Own Any NFT's</h3></>}
              </div>
            </div>
            <div className="left border rounded-md p-5 my-10 mx-40">
              <div className="flex text-center flex-col mt-11 md:text-2xl">
                <div className="mb-5">
                  <h2 className="font-bold">
                    Wallet Address{" "}
                    <FontAwesomeIcon
                      className="mx-3 text-red-300"
                      icon={faFingerprint}
                    />
                  </h2>
                  <p className="border rounded-md p-5 mt-3 text-green-500 flex">
                    {address.substring(0, 25) + "..."}
                    <span className="mx-3 h-100 hover:text-green-600">
                      <FontAwesomeIcon icon={faCopy} />
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex p-3 border rounded-md mt-3 flex-row text-center justify-center mt-10 md:text-2xl h-100">
                <div>
                  <h2 className="">Total NFT's</h2>
                  <b className="">{data.length}</b>
                </div>
                <div className="ml-20">
                  <h2 className="">Total Value</h2>
                  <b className="mt-3">{totalPrice} ETH</b>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          {" "}
          <h3>Loading</h3>
        </div>
      )}
    </div>
  );
}
