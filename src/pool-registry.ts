import {
  PoolRegistered as PoolRegisteredEvent
} from "../generated/PoolRegistry/PoolRegistry"
import { PoolLens as PoolLensContract } from '../generated/PoolRegistry/PoolLens'
import {
  Pool
} from "../generated/schema"
import { Pool as PoolDataSource } from "../generated/templates"
import { Address, BigInt, log } from '@graphprotocol/graph-ts'

const RiskRatings = ['VERY_HIGH_RISK', 'HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK', 'MINIMAL_RISK']

const POOL_LENS_ADDRESS = Address.fromString("0x525FAEcE436cF0702b399A9Ef48EAb358E43A671")
const POOL_REGISTRY_ADDRESS = Address.fromString("0x6e8813dD1a5714182C700A6ba3A05a482b36dEdf")

export function handlePoolRegistered(event: PoolRegisteredEvent): void {
  const comptrollerAddress = event.params.comptroller
  PoolDataSource.create(comptrollerAddress)

  const pool = new Pool(comptrollerAddress.toHexString())

  const poolLensContract = PoolLensContract.bind(POOL_LENS_ADDRESS)

  const getPoolByComptrollerResult = poolLensContract.try_getPoolByComptroller(
    POOL_REGISTRY_ADDRESS,
    comptrollerAddress,
  );

  if (getPoolByComptrollerResult.reverted) {
    log.error('Unable to fetch pool info for {} with lens {}, getPoolByComptroller reverted', [
      comptrollerAddress.toHexString(),
      POOL_LENS_ADDRESS.toHexString(),
    ]);
  } else {
    log.info('Got pool info for {} with lens {}', [
      comptrollerAddress.toHexString(),
      POOL_LENS_ADDRESS.toHexString(),
    ]);
    const poolDataFromLens = getPoolByComptrollerResult.value
    pool.name = poolDataFromLens.name
    pool.creator = poolDataFromLens.creator
    pool.blockPosted = poolDataFromLens.blockPosted
    pool.timestampPosted = poolDataFromLens.timestampPosted
    pool.riskRating = RiskRatings[poolDataFromLens.riskRating]
    pool.category = poolDataFromLens.category
    pool.logoUrl = poolDataFromLens.logoURL
    pool.description = poolDataFromLens.description
    pool.priceOracle = poolDataFromLens.priceOracle
    pool.closeFactor = poolDataFromLens.closeFactor ? poolDataFromLens.closeFactor : new BigInt(0)
    pool.minLiquidatableCollateral = BigInt.fromI32(0)
    pool.liquidationIncentive = poolDataFromLens.liquidationIncentive
      ? poolDataFromLens.liquidationIncentive
      : new BigInt(0)
    pool.maxAssets = poolDataFromLens.maxAssets ? poolDataFromLens.maxAssets : new BigInt(0)

    pool.save()
  }

  const getAllPoolsRes = poolLensContract.try_getAllPools(
    POOL_REGISTRY_ADDRESS,
  );

  if (getAllPoolsRes.reverted) {
    log.error('getAllPools is reverted too', [])
  } else { 
    log.info('getAllPools works - {} pools', [getAllPoolsRes.value.length.toString()])
    for (let index = 0; index < getAllPoolsRes.value.length; index++) {
      const pool = getAllPoolsRes.value[index];
      log.info('pool name {} on block {}', [
        pool.name,
        pool.blockPosted.toString()
      ]);
    }
  }
}
