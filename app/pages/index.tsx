import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from '../components/bounties/BountyCard';
import { ToastContainer } from 'react-toastify';
import BountyCreation from '../components/bounties/BountyCreation';
import { ZeroAddress, ethers } from 'ethers';
import { Bounty } from '../interfaces/BountiesInterface';
import { useContractData } from '../context/ContractContext'

const BOUNTIES_PER_PAGE = 18;

/**
 * Fetches a list of unclaimed bounties from the blockchain.
 *
 * @param {object} connectedContract - The contract instance to interact with the blockchain.
 * @param {number|null} count - The maximum number of bounties to fetch. If null, fetches as many as possible.
 * @param {number} startIndex - The starting index from which to fetch the bounties.
 * @returns An object containing the list of fetched bounties, a boolean indicating if more bounties are available, and the last index processed.
 */
const fetchBounties = async (
  connectedContract: any,
  count: number | null = null,
  startIndex: number | null = null
) => {
  try {
    if (connectedContract) {
      // Get the total number of bounties and adjust for zero-based indexing
      const allBountiesLength =
        Number(await connectedContract.getBountiesLength()) - 1;
      let unclaimedBounties = [] as Bounty[];
      // Start fetching from the provided startIndex
      let index = startIndex || allBountiesLength;
      const batchSize = 20; // Number of bounties to fetch in each batch
      let hasMore = true; // Indicates if more bounties are available
      let lastIndex = index; // Keeps track of the last index processed

      while (index >= 0 && index <= allBountiesLength) {
        // Calculate the range of indices for the current batch
        const start = Math.max(0, index - batchSize + 1);
        const end = index;

        // Fetch a batch of bounties from the contract
        const bountyBatch: any[] = await connectedContract.getBounties(start, end);
        // Process and filter the fetched bounties
        const filteredBounties: Bounty[] = bountyBatch
          .map(bounty => ({
            id: Number(bounty.id),
            issuer: bounty.issuer,
            name: bounty.name,
            description: bounty.description,
            amount: Number(ethers.formatEther(bounty.amount)),
            claimer: bounty.claimer,
            claimId: bounty.claimId,
            createdAt: Number(bounty.createdAt),
          }))
          .filter(
            bounty => bounty.claimer === ZeroAddress && bounty.amount > 0
          );
        unclaimedBounties = [...filteredBounties, ...unclaimedBounties];

        // Check if enough bounties have been fetched or if the start of the array is reached
        if (
          (count !== null && unclaimedBounties.length >= count) ||
          start === 0
        ) {
          // Sort bounties by creation date
          unclaimedBounties.sort((a, b) => b.createdAt - a.createdAt);
          // Update hasMore to indicate if there are more bounties to fetch
          hasMore = start > 0;

          // If more bounties are fetched than requested, adjust the count and lastIndex
          if (count !== null && unclaimedBounties.length > count) {
            // Calculate the correct lastIndex after trimming the array
            lastIndex = start + unclaimedBounties.length - count - 1;
            // Trim the array to the requested size
            unclaimedBounties = unclaimedBounties.slice(0, count);
          }
          break;
        }

        // Update lastIndex for the next iteration
        lastIndex = start - 1;
        // Move to the next batch
        index -= batchSize;
      }
      return {
        bounties: unclaimedBounties != null ? unclaimedBounties : [],
        hasMore: hasMore != null ? hasMore : false,
        lastIndex: lastIndex != null ? lastIndex : false,
      };

    }
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return {
      bounties: [], // Default to an empty array if undefined
      hasMore: false, // Determine based on your logic
      lastIndex: 0 // Default to 0 or appropriate value if undefined
    };
  }
};

const Home: React.FC = () => {
  const {
    fetchAllBounties,
    getContract,
    cancelBounty,
    wallet,
    connect,
    disconnect,
    connecting,
    userBalance,
  } = useContractData();

  const [showCreateBounty, setShowCreateBounty] = useState(false);

  const [bounties, setBounties] = useState([] as Bounty[]);
  const [hasMore, setHasMore] = useState(true);

  const [offset, setOffset] = useState(0);
  const [isUpdating, setIsUpdating] = useState(true);
  const intervalId = useRef();

  useEffect(() => {
    const fetchInitialBounties = async () => {
      const contract = await getContract();
      // Fetch BOUNTIES_PER_PAGE bounties when the component mounts
      const { bounties, hasMore, lastIndex } = await fetchBounties(
        contract,
        BOUNTIES_PER_PAGE
      ) ?? { bounties: [], hasMore: false, lastIndex: 0 };
      setBounties(bounties);
      setHasMore(hasMore);
      setOffset(Number(lastIndex));
    };

    fetchInitialBounties();
  }, []);

  const handleCreateBounty = () => {
    setShowCreateBounty(!showCreateBounty);
  };

  const loadMoreBounties = async () => {
    setIsUpdating(false);
    const contract = await getContract();

    const { bounties: moreBounties, hasMore, lastIndex, } = await fetchBounties(
      contract,
      BOUNTIES_PER_PAGE,
      offset - BOUNTIES_PER_PAGE
    ) ?? { bounties: [], hasMore: false, lastIndex: 0 };

    setBounties([...bounties, ...moreBounties]);
    setHasMore(hasMore);
    setOffset(Number(lastIndex));
    setIsUpdating(true);
    console.log("isUpdating: ", isUpdating);
    console.log("intervalId: ", intervalId);
  };

  return (
    <div className="my-bounties-wrap">
      <>
        <div className="all-bounties-wrap">
          <div className="all-bounties-control">
            <div className="all-bounties-header">
              <h1 data-aos="fade-in">pics or it didn&#39;t happen</h1>
              <header data-aos="fade-in">
                <h1>📸🧾</h1>
              </header>
            </div>
            <div className="all-bounties-action">
              {!wallet ? (
                <div className="bounty-details-connect-claim-button-wrap">
                  <button
                    disabled={connecting}
                    onClick={() =>
                      wallet ? disconnect({ label: wallet.label }) : connect()
                    }
                  >
                    {connecting
                      ? 'connecting'
                      : wallet
                        ? 'disconnect'
                        : 'connect'}
                  </button>
                </div>
              ) : (
                !showCreateBounty && (
                  <div className="bounty-details-connect-claim-button-wrap">
                    <button onClick={() => handleCreateBounty()}>
                      create bounty
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="bounties-grid all-bounties-grid">
            {bounties
              ?.filter(bounty => bounty.amount > 0)
              .map((bounty, index) => (
                <BountyCard
                  key={index}
                  bounty={bounty}
                  wallet={wallet}
                  cancelBounty={cancelBounty}
                  refreshBounties={fetchAllBounties}
                  showClaim={false}
                />
              ))}
          </div>
          <div className="load-more-wrap">
            {hasMore && <button onClick={loadMoreBounties}>Load More</button>}
          </div>
        </div>
        <ToastContainer />
        {showCreateBounty && (
          <div className="bounty-creation-wrapper">
            <BountyCreation
              userBalance={userBalance}
            />
          </div>
        )}
      </>
    </div>
  );
}

export default Home;
