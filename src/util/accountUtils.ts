import * as Kilt from '@kiltprotocol/sdk-js';

export async function generateAccount(
  mnemonic: string
): Promise<Kilt.KeyringPair> {
  const keyring = new Kilt.Utils.Keyring({
    ss58Format: 38,
    type: 'sr25519',
  });

  return keyring.addFromMnemonic(mnemonic);
}

export async function getFullDid(
  didUri: Kilt.DidUri
): Promise<Kilt.Did.FullDidDetails> {
  return await Kilt.Did.FullDidDetails.fromChainInfo(didUri);
}

export async function generateFullKeypairs(
  keystore: Kilt.Did.DemoKeystore,
  mnemonic?: string
): Promise<{
  authentication: Kilt.NewDidVerificationKey;
  keyAgreement: Kilt.NewDidEncryptionKey;
  assertionMethod: Kilt.NewDidVerificationKey;
  capabilityDelegation: Kilt.NewDidVerificationKey;
}> {
  // signing keypair
  const signing = await keystore.generateKeypair({
    alg: Kilt.Did.SigningAlgorithms.Sr25519,
    seed: mnemonic,
  });

  // encryption keypair
  const encryption = await keystore.generateKeypair({
    alg: Kilt.Did.EncryptionAlgorithms.NaclBox,
    seed: mnemonic,
  });

  // build the Attester keys object
  const keys = {
    authentication: {
      publicKey: signing.publicKey,
      type: Kilt.VerificationKeyType.Sr25519,
    },
    keyAgreement: {
      publicKey: encryption.publicKey,
      type: Kilt.EncryptionKeyType.X25519,
    },
    capabilityDelegation: {
      publicKey: signing.publicKey,
      type: Kilt.VerificationKeyType.Sr25519,
    },
    assertionMethod: {
      publicKey: signing.publicKey,
      type: Kilt.VerificationKeyType.Sr25519,
    },
  };

  return keys;
}
