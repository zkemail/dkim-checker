import axios from 'axios';
import { ethers } from 'ethers';
import { WebSocketServer } from 'ws';
import { getModulusHexFromBase64 } from './hexFromBase64';

const poseidonNode = require('poseidon-rs/poseidon-node');

require('dotenv').config();

// WebSocket server configuration
const wss = new WebSocketServer({ port: 8080 });

// Ethereum provider configuration
const websocketProviderUrl = process.env.WEBSOCKET_PROVIDER_URL || 'defaultWebSocketProviderUrl';
console.log(`WebSocket Provider URL: ${websocketProviderUrl}`);
const provider = new ethers.WebSocketProvider(websocketProviderUrl);

// Registry contract address
const contractAddress = process.env.CONTRACT_ADDRESS || "defaultAddress";
console.log(`Contract Address: ${contractAddress}`);
const contractABI = [
  'event DKIMPublicKeyHashRegistered(string indexed domainName, bytes32 indexed publicKeyHash, address indexed authorizer)',
  'function setDKIMPublicKeyHash(string domainName, bytes32 publicKeyHash, address authorizer, bytes signature) public'
];

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Monitor DKIMPublicKeyHashRegistered event and send to client
contract.on('DKIMPublicKeyHashRegistered', async (domainName: string, publicKeyHash: string, authorizer: string, event) => {
  const message = `Detected DKIMPublicKeyHashRegistered event: Domain Name ${domainName}, Public Key Hash ${publicKeyHash}, Authorizer ${authorizer}`;
  console.log(message);
  console.dir(event.log.transactionHash);

  // Get the transaction details
  const tx = await provider.getTransaction(event.log.transactionHash);
  console.log(`Transaction Hash: ${event.log.transactionHash}`);

  if (tx == null) {
    return;
  }

  // Decode the input data
  const iface = new ethers.Interface(contractABI);
  const decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });

  if (decodedData == null) {
    return;
  }
  // Assuming the function is always setDKIMPublicKeyHash
  const [decodedDomainName, decodedPublicKeyHash, decodedAuthorizer, signature] = decodedData.args;

  console.log(`Function Name: ${decodedData.name}`);
  console.log(`Decoded Domain Name: ${decodedDomainName}`);
  console.log(`Decoded Public Key Hash: ${decodedPublicKeyHash}`);
  console.log(`Decoded Authorizer: ${decodedAuthorizer}`);
  console.log(`Signature: ${signature}`);

  // Send value to the following URL from the domain name
  let hashesMatched = false;
  try {
    const response = await axios.get(`https://archive.prove.email/api/key?domain=${decodedDomainName}`);
    console.log('API Response:', response.data);

    // Retrieve the object from the returned array in order and get the value field
    response.data.forEach((obj: { value: string }) => {
      const valueField = obj.value;
      console.log('Value Field:', valueField);

      const match = valueField.match(/p=([^;]+)/);
      if (match) {
        const base64EncodedP = match[1];
        console.log('Base64 Encoded p:', base64EncodedP);

        // Use the imported function to get the modulus in hex
        const modulusHex = getModulusHexFromBase64(base64EncodedP);
        console.log('Modulus in Hex:', modulusHex);

        // Get public key hash using the imported function
        const publicKeyHashValue = poseidonNode.publicKeyHash(modulusHex);
        console.log('Public Key Hash:', publicKeyHashValue);

        // Check if decodedPublicKeyHash and publicKeyHashValue are equal
        if (decodedPublicKeyHash === publicKeyHashValue) {
          hashesMatched = true;
          return; // Exit the try block if inside a function
          // or use break; if inside a loop
        }
      }
    });

  } catch (error) {
    console.error('Error fetching data from API:', error);
  } finally {
    // Log an error if the hashes never matched
    if (!hashesMatched) {
      const errorMessage = `Error: Registered Hash ${decodedPublicKeyHash} did not match. domain = ${decodedDomainName}, authorizer = ${decodedAuthorizer}`;
      console.error(errorMessage);
      // Send error message to WebSocket client if connected
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(errorMessage);
        }
      });
    }
  }
});

// When a WebSocket client connects
wss.on('connection', (ws) => {
  console.log('Client connected');
});

console.log('WebSocket server started on port 8080');