import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  MarketAdded,
  OwnershipTransferred,
  PoolMedatataUpdated,
  PoolNameSet,
  PoolRegistered
} from "../generated/PoolRegistry/PoolRegistry"

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createMarketAddedEvent(
  index: BigInt,
  comptroller: Address,
  vTokenAddress: Address
): MarketAdded {
  let marketAddedEvent = changetype<MarketAdded>(newMockEvent())

  marketAddedEvent.parameters = new Array()

  marketAddedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  marketAddedEvent.parameters.push(
    new ethereum.EventParam(
      "comptroller",
      ethereum.Value.fromAddress(comptroller)
    )
  )
  marketAddedEvent.parameters.push(
    new ethereum.EventParam(
      "vTokenAddress",
      ethereum.Value.fromAddress(vTokenAddress)
    )
  )

  return marketAddedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPoolMedatataUpdatedEvent(
  index: BigInt,
  comptrollerAddress: Address,
  riskRating: i32,
  category: string
): PoolMedatataUpdated {
  let poolMedatataUpdatedEvent = changetype<PoolMedatataUpdated>(newMockEvent())

  poolMedatataUpdatedEvent.parameters = new Array()

  poolMedatataUpdatedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  poolMedatataUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "comptrollerAddress",
      ethereum.Value.fromAddress(comptrollerAddress)
    )
  )
  poolMedatataUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "riskRating",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(riskRating))
    )
  )
  poolMedatataUpdatedEvent.parameters.push(
    new ethereum.EventParam("category", ethereum.Value.fromString(category))
  )

  return poolMedatataUpdatedEvent
}

export function createPoolNameSetEvent(
  comptroller: Address,
  name: string
): PoolNameSet {
  let poolNameSetEvent = changetype<PoolNameSet>(newMockEvent())

  poolNameSetEvent.parameters = new Array()

  poolNameSetEvent.parameters.push(
    new ethereum.EventParam(
      "comptroller",
      ethereum.Value.fromAddress(comptroller)
    )
  )
  poolNameSetEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return poolNameSetEvent
}

export function createPoolRegisteredEvent(
  index: BigInt,
  pool: ethereum.Tuple
): PoolRegistered {
  let poolRegisteredEvent = changetype<PoolRegistered>(newMockEvent())

  poolRegisteredEvent.parameters = new Array()

  poolRegisteredEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  poolRegisteredEvent.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromTuple(pool))
  )

  return poolRegisteredEvent
}
