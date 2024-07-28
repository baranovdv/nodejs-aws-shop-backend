import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  const token = event.authorizationToken;

  if (!token) {
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const storedPassword = process.env.PASSWORD;

  const credentialsBase64 = token.split(" ")[1];
  const credentials = Buffer.from(credentialsBase64, "base64").toString();
  const [login, password] = credentials.split(":");

  if (password === storedPassword) {
    return generateToken(credentialsBase64, event.methodArn, "Allow");
  } else {
    return generateToken(credentialsBase64, event.methodArn, "Deny");
  }
};

function generateToken(
  principalId: string,
  resource: string,
  effect = "Allow"
) {
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
