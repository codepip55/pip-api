import { Body, Controller, ForbiddenException, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { el } from 'date-fns/locale';
import { getSeconds } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as argon from 'argon2';

import { Oauth2Service } from './oauth2.service';
import { User } from 'src/users/schemas/users.schema';

@Controller('oauth2')
@ApiTags('OAuth2')
export class Oauth2Controller {
    constructor(
        private oauthService: Oauth2Service,
        private configService: ConfigService
    ) {}

    @Get('authorize')
    async authorize(@Query() qs: Record<string, any>, @Res() res: Response, @Req() req: Request) {
        const response_type = qs.response_type;
        const client_id = qs.client_id;
        const redirect_uri = qs.redirect_uri;
        const state = qs.state;
        const scope = qs.scope

        if (response_type !== 'code') throw new ForbiddenException('response_type must be "code"');

        const client = await this.oauthService.findClient(client_id);

        if (!client.redirectUris.includes(redirect_uri)) throw new ForbiddenException('Invalid redirect_uri');

        const scopes = scope.split(' ');

        // If user has not logged in, show login page
        let user;
        if (req.user) {
            user = req.user as User
        } else {
            const params = new URLSearchParams({
                response_type,
                client_id,
                redirect_uri,
                state,
                scope
            })
            return res.redirect(`${this.configService.get<string>('AUTH_CLIENT')}?redirect=${this.configService.get<string>('THIS_URI')}/oauth/authorize&${params.toString()}`)
        }

        const authCode = await this.oauthService.createAuthCode(
            client,
            user,
            scopes,
            redirect_uri
        )

        res.redirect(`${authCode.redirectUri}?code=${authCode.authorizationCode}`)
    }

    @Post('token')
    async token(@Query() qs: Record<string, string>) {
        const code = qs.code;
        const client_id = qs.client_id;
        const client_secret = qs.client_secret;
        const grant_type = qs.grant_type;
        const redirect_uri = qs.redirect_uri;
        const refresh_token = qs.refresh_token;

        if (!client_id || !client_secret || !grant_type || !redirect_uri) throw new ForbiddenException('Request is missing required fields');

        const client = await this.oauthService.findClient(client_id, client_secret);
        if (!client.redirectUris.includes(redirect_uri)) throw new ForbiddenException('Invalid redirect_uri');

        if (grant_type === 'authorization_code') {
            if (!code) throw new ForbiddenException('Missing code');

            const authCode = await this.oauthService.findAuthCode(code);
            if (!authCode || authCode.expiresAt < new Date()) throw new ForbiddenException('Invalid code')

            const accessToken = await this.oauthService.createAccessToken(authCode.client, authCode.scopes, authCode.user);
            const refreshToken = await this.oauthService.createRefreshToken(accessToken.client, accessToken.user, accessToken.scopes);
            await this.oauthService.revokeAuthCode(authCode.authorizationCode);

            return {
                access_token: accessToken.accessToken,
                expires_in: getSeconds(accessToken.accessTokenExpiresAt),
                refreshToken: refreshToken.refreshToken,
                token_type: 'Bearer',
                scope: accessToken.scopes
            }
        } else if (grant_type === 'refresh_token') {
            if (!refresh_token) throw new ForbiddenException('Missing refresh token')

            const oldRefreshToken = await this.oauthService.findRefreshToken(refresh_token);
            if (!oldRefreshToken) throw new ForbiddenException('Invalid refresh_token')

            this.oauthService.revokeAllUsersAccessTokens(oldRefreshToken.user);
            const accessToken = await this.oauthService.createAccessToken(oldRefreshToken.client, oldRefreshToken.scopes, oldRefreshToken.user)

            this.oauthService.revokeAllUsersRefreshTokens(oldRefreshToken.user);
            const refreshToken = await this.oauthService.createRefreshToken(accessToken.client, accessToken.user, accessToken.scopes);

            return {
                access_token: accessToken.accessToken,
                expires_in: getSeconds(accessToken.accessTokenExpiresAt),
                refreshToken: refreshToken.refreshToken,
                token_type: 'Bearer',
                scope: accessToken.scopes
            }
        } else {
            throw new ForbiddenException('Invalid grant_type');
        }
    }

    @Post('token/revoke')
    async revokeToken(@Query() qs: Record<string, string>) {
        const token_type = qs.token_type;
        const token = qs.token;

        if (token_type === 'access_token') return await this.oauthService.revokeAccessToken(token);
        if (token_type === 'refresh_token') return await this.oauthService.revokeRefreshToken(token);
        throw new ForbiddenException('Invalid token_type');
    }

    @Post('password')
    async verifyPassword(@Body() body: Record<string, string>): Promise<boolean> {
        let email = body.email;
        let password = body.password;

        return this.oauthService.verifyPassword(email, password)
    }

    // TODO: Add activate account email
}
