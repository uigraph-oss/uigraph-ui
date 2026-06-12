#!/bin/sh

set -e

AWS_REGION="us-east-1"
DEV_AWS_DOMAIN_OWNER="120516861714"
PROD_AWS_DOMAIN_OWNER="351352952121"
AWS_DOMAIN="uigraph"
AWS_REPO="npm-sdk"
export AWS_PROFILE="${AWS_PROFILE:-terraform-uigraph-nonprod}"
DEPLOY_ENV="${NEXT_PUBLIC_DEPLOY_ENV:-${DEPLOY_ENV:-${AWS_BRANCH:-development}}}"

if [ -z "${AWS_DOMAIN_OWNER:-}" ]; then
	case "$DEPLOY_ENV" in
		prod|production|main|master)
			AWS_DOMAIN_OWNER="$PROD_AWS_DOMAIN_OWNER"
			;;
		*)
			AWS_DOMAIN_OWNER="$DEV_AWS_DOMAIN_OWNER"
			;;
	esac
fi

echo "> npm base registry: $(npm config get registry)"
echo "> @uigraph registry: $(npm config get @uigraph:registry)"
echo "> Deploy env: $DEPLOY_ENV"
echo "> Using CodeArtifact domain owner: $AWS_DOMAIN_OWNER"

TOKEN=$(aws codeartifact get-authorization-token \
	--region $AWS_REGION \
	--domain $AWS_DOMAIN \
	--domain-owner $AWS_DOMAIN_OWNER \
	--query authorizationToken --output text)

echo "> Setting npm @$AWS_DOMAIN:registry"
npm config set @$AWS_DOMAIN:registry=https://$AWS_DOMAIN-$AWS_DOMAIN_OWNER.d.codeartifact.$AWS_REGION.amazonaws.com/npm/$AWS_REPO/
npm config set //${AWS_DOMAIN}-${AWS_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/$AWS_REPO/:_authToken=$TOKEN

if [ -f package-lock.json ]; then
	echo "> Rewriting CodeArtifact URLs in package-lock.json"
	TARGET_HOST="$AWS_DOMAIN-$AWS_DOMAIN_OWNER.d.codeartifact.$AWS_REGION.amazonaws.com/npm/$AWS_REPO/"
	TARGET_HOST="$TARGET_HOST" node <<'EOF'
const fs = require("fs");

const lockfilePath = "package-lock.json";
const targetHost = process.env.TARGET_HOST;
const content = fs.readFileSync(lockfilePath, "utf8");
const pattern =
	/https:\/\/uigraph-\d+\.d\.codeartifact\.us-east-1\.amazonaws\.com\/npm\/npm-sdk\//g;
const updated = content.replace(pattern, `https://${targetHost}`);

if (updated !== content) {
	fs.writeFileSync(lockfilePath, updated);
}
EOF
fi
