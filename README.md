# Debugging calls reverted on deployed subgraph

This repo contains a minimal setup to reproduce the issue found after deploying a subgraph. The core logic can be found on `src/pool-registry.ts`.

A brief description of our scenario is:
- An event `PoolRegistered` gets fired, indicating the creation of a `Pool`
- The handler `handlePoolRegistered` catches the event and its params
- We then instantiate the `PoolLens` contract, which has a function called `getPoolByComptroller`
- calling `getPoolByComptroller` passing the address for the pool's comptroller should return a tuple containing info for the pool (name, creator, block posted, etc).
- with this info, we are able to fill in the fields save the Pool entity

On chapel there are two of these events, one on block 24711689, another one on block 24785594: https://testnet.bscscan.com/address/0x6e8813dd1a5714182c700a6ba3a05a482b36dedf

However, we are facing issues after deploying to The Graph. This sample subgraph was deployed to:
https://thegraph.com/hosted-service/subgraph/gleiser-oliveira/sg-lens-revert-call

What we observe is that calling `getPoolByComptroller` on the deployed subgraph returns an empty response and this is considered a revert. This is verified by the logs generated on the subgraph:
```
1/4/2023, 9:32:34 PM INFO Contract call reverted, reason: empty response

1/4/2023, 9:32:34 PM ERROR Unable to fetch pool info for 0xfb0c558979225c62eb5cec897e30c70877cfca2d with lens 0x525faece436cf0702b399a9ef48eab358e43a671, getPoolByComptroller reverted, data_source: PoolRegistry

1/4/2023, 9:34:45 PM INFO Contract call reverted, reason: empty response

1/4/2023, 9:34:45 PM ERROR Unable to fetch pool info for 0x7bc8a7762c9a7fc0327b78244c2e85538f230007 with lens 0x525faece436cf0702b399a9ef48eab358e43a671, getPoolByComptroller reverted, data_source: PoolRegistry
```

Locally I was able to get a valid response by using Ankr's Chapel RPC: https://rpc.ankr.com/bsc_testnet_chapel.

```
cargo run -p graph-node --release -- \
  --postgres-url postgresql://postgres:postgres@localhost:5432/graph-node \
  --ethereum-rpc chapel:full,archive:https://rpc.ankr.com/bsc_testnet_chapel \
  --ipfs 0.0.0.0:5001
```

Logs generated:
```
Jan 04 21:40:36.347 INFO Got pool info for 0xfb0c558979225c62eb5cec897e30c70877cfca2d with lens 0x525faece436cf0702b399a9ef48eab358e43a671, data_source: PoolRegistry, sgd: 1, subgraph_id: QmXJZh3Xb9R8qksURgVkgTctGZV4GzdznBc3BS1dSUYaYB, component: SubgraphInstanceManager
Jan 04 21:40:55.942 INFO Got pool info for 0x7bc8a7762c9a7fc0327b78244c2e85538f230007 with lens 0x525faece436cf0702b399a9ef48eab358e43a671, data_source: PoolRegistry, sgd: 1, subgraph_id: QmXJZh3Xb9R8qksURgVkgTctGZV4GzdznBc3BS1dSUYaYB, component: SubgraphInstanceManager
```

And querying is sucessful:
```
{
  pools {
    id
    blockPosted
  }
}
```
Returns
```
{
  "data": {
    "pools": [
      {
        "id": "0x7bc8a7762c9a7fc0327b78244c2e85538f230007",
        "blockPosted": "24785594"
      },
      {
        "id": "0xfb0c558979225c62eb5cec897e30c70877cfca2d",
        "blockPosted": "24711689"
      }
    ]
  }
}
```

## Additional Info

At the end of `handlePoolRegistered`, I added a different contract call to check if this issue is specific to `getPoolByComptroller`.

- we call `getAllPools` to merely check if it comes as reverted
- if it's reverted, we log the error
- if not, we log how many pools it returned

Locally, this is a success:
```
Jan 04 21:54:35.386 INFO getAllPools works - 2 pools, data_source: PoolRegistry, sgd: 1, subgraph_id: Qmb7NYX19mz3Kuj1sCn1vNJ6c4AYPGutiFRjd2f3ZhWaaS, component: SubgraphInstanceManager
```
Unfortunately, when deployed it is also considered as a revert
```
1/4/2023, 9:55:39 PM INFO Contract call reverted, reason: empty response
1/4/2023, 9:55:39 PM ERROR getAllPools is reverted too, data_source: PoolRegistry
```

If needed, we can check on bscscan the return values for these functions: https://testnet.bscscan.com/address/0x525faece436cf0702b399a9ef48eab358e43a671#readContract

poolRegistryAddress = `0x6e8813dD1a5714182C700A6ba3A05a482b36dEdf`

Pool 1 - block 24711689
comptroller = `0xfb0c558979225c62eb5cec897e30c70877cfca2d`

Pool 2 - block 24785594
comptroller = `0x7bc8a7762c9a7fc0327b78244c2e85538f230007`
