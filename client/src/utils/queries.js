import gql from "graphql-tag";

export const GET_ME = gql`
  {
    me {
      _id
      email
      username
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
