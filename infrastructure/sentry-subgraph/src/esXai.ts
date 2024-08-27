import {  BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { 
    RedemptionStarted as RedemptionStartedEvent,
    RedemptionCancelled as RedemptionCancelledEvent,
    RedemptionCompleted as RedemptionCompletedEvent,
    VoucherIssued as VoucherIssuedEvent
} from "../generated/esXai/esXai";
import { RedemptionRequest } from "../generated/schema";

export function handleRedemptionStarted(event: RedemptionStartedEvent): void {

    // Create a new redemption request entity 
    const request = new RedemptionRequest(event.params.user.toHexString() + "_"  + event.params.index.toString());
    
    // Decode the transaction input data to get the redemption amount and duration
    const inputData = event.transaction.input.toHexString().slice(10); // Remove function selector
    const decoded = ethereum.decode('(uint256,uint256)', Bytes.fromHexString(inputData) as Bytes);

    if (decoded) {      
        const decodedTuple = decoded.toTuple();
            request.amount = decodedTuple[0].toBigInt();
            request.duration = decodedTuple[1].toBigInt();
    } else {
        log.warning("Failed to decode startRedemption TX: {}", [event.transaction.hash.toHexString()]);
        return;
    }
    request.sentryWallet = event.params.user.toHexString();
    request.index = event.params.index;
    request.startTime = event.block.timestamp;
    request.claimableTime = event.block.timestamp.plus(request.duration);
    request.endTime = BigInt.fromI32(0);
    request.cancelled = false;
    request.completed = false;
    request.voucherIssued = false;
    request.save();
}

export function handleRedemptionCancelled(event: RedemptionCancelledEvent): void {
    const request = RedemptionRequest.load(event.params.user.toHexString() + "_"  + event.params.index.toString());

    if(!request) {
        log.warning("Failed to find redemption request on handleRedemptionCancelled: TX: " + event.transaction.hash.toHexString() + ", user: " + event.params.user.toHexString() + ", index: " + event.params.index.toString(), []);
        return;
    }

    request.cancelled = true;
    request.endTime = event.block.timestamp;
    request.completed = true;
    request.save();
    
}
export function handleRedemptionCompleted(event: RedemptionCompletedEvent): void {
    const request = RedemptionRequest.load(event.params.user.toHexString() + "_"  + event.params.index.toString());

    if(!request) {
        log.warning("Failed to find redemption request on handleRedemptionCompleted: TX: " + event.transaction.hash.toHexString() + ", user: " + event.params.user.toHexString() + ", index: " + event.params.index.toString(), []);
        return;
    }

    request.endTime = event.block.timestamp;
    request.completed = true;
    request.save();    
}

export function handleVoucherIssued(event: VoucherIssuedEvent): void {

    // Get the user and  indices of the vouchers issued
    const user = event.params.user.toHexString();
    const indices = event.params.indices;
    
    // Loop through the indices and update the voucherIssued field on the redemption request
    for (let i = 0; i < indices.length; i++) {

        // Load the existing redemption request from the store
        const request = RedemptionRequest.load(user + "_"  + indices[i].toString());

        if(!request) {
            log.warning("Failed to find redemption request on handleVoucherIssued: TX: " + event.transaction.hash.toHexString() + ", user: " + user + ", index: " + indices[i].toString(), []);
            continue;
        }

        // Update the voucherIssued field and save the request
        request.voucherIssued = true;
        request.save();
    }

}