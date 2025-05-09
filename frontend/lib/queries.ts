import { gql } from "@apollo/client";

export const CHALLENGE_MUTATION = gql`
  mutation Challenge($request: ChallengeRequest!) {
    challenge(request: $request) {
      id
      text
    }
  }
`;

// Mutation to authenticate with SignedAuthChallenge
export const AUTHENTICATE_MUTATION = gql`
  mutation Authenticate($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      ... on AuthenticationTokens {
        accessToken
        refreshToken
        idToken
      }

      ... on WrongSignerError {
        reason
      }

      ... on ExpiredChallengeError {
        reason
      }

      ... on ForbiddenError {
        reason
      }
    }
  }
`;

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccountWithUsername(
    $request: CreateAccountWithUsernameRequest!
  ) {
    createAccountWithUsername(request: $request) {
      __typename
      ... on CreateAccountResponse {
        hash
      }
      ... on UsernameTaken {
        reason
      }
      ... on NamespaceOperationValidationFailed {
        reason
      }
      ... on TransactionWillFail {
        reason
      }
    }
  }
`;

export const SET_ACCOUNT_METADATA_MUTATION = gql`
  mutation SetAccountMetadata($request: SetAccountMetadataRequest!) {
    setAccountMetadata(request: $request) {
      __typename
      ... on SetAccountMetadataResponse {
        hash
      }
      ... on TransactionWillFail {
        reason
      }
    }
  }
`;

export const TRANSACTION_STATUS_QUERY = gql`
  query TransactionStatus($txHash: String!) {
    transactionStatus(request: { txHash: $txHash }) {
      ... on NotIndexedYetStatus {
        reason
        txHasMined
      }
      ... on PendingTransactionStatus {
        blockTimestamp
      }
      ... on FinishedTransactionStatus {
        blockTimestamp
      }
      ... on FailedTransactionStatus {
        reason
        blockTimestamp
      }
    }
  }
`;

export const ACCOUNT_QUERY = gql`
  query account($request: AccountRequest!) {
    account(request: $request) {
      address
      owner
      createdAt
      metadata {
        picture
        bio
        name
        attributes {
          key
          value
          type
        }
      }
      username {
        localName
      }
    }
  }
`;

export const SWITCH_ACCOUNT_MUTATION = gql`
  mutation switchAccount($request: SwitchAccountRequest!) {
    switchAccount(request: $request) {
      ... on AuthenticationTokens {
        accessToken
        refreshToken
        idToken
      }

      ... on ForbiddenError {
        reason
      }
    }
  }
`;
export const ACCOUNTS_AVAILABLE_QUERY = gql`
  query AccountsAvailable($managedBy: String!, $includeOwned: Boolean!) {
    accountsAvailable(
      request: { managedBy: $managedBy, includeOwned: $includeOwned }
    ) {
      items {
        ... on AccountManaged {
          account {
            address
            owner
            createdAt
            score
            username {
              localName
            }
            metadata {
              picture
              bio
              name
              attributes {
                key
                value
                type
              }
            }
          }
          addedAt
        }
        ... on AccountOwned {
          account {
            address
            owner
            createdAt
            score
            username {
              localName
            }
            metadata {
              picture
              bio
              name
              attributes {
                key
                value
                type
              }
            }
          }
          addedAt
        }
      }
      pageInfo {
        next
        prev
      }
    }
  }
`;
