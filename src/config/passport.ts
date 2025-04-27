import { Express } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { compareSync } from 'bcrypt';
import { getUserById, getUserByEmail } from '../api/v1/modules/user/userService';

export const setupPassport = (app: Express): void => {
  app.use(passport.initialize());

  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await getUserByEmail(email);

          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }

          const isPasswordValid = compareSync(password, user.password);

          if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect email or password' });
          }

          // Ensure we use properly defined user with required id field
          const safeUser: Express.User = {
            id: user.id || '',
            email: user.email,
            role: user.role,
          };

          return done(null, safeUser);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      },
      async (jwtPayload, done) => {
        try {
          const user = await getUserById(jwtPayload.id);

          if (!user) {
            return done(null, false);
          }

          // Ensure we use properly defined user with required id field
          const safeUser: Express.User = {
            id: user.id || '',
            email: user.email,
            role: user.role,
          };

          return done(null, safeUser);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );
};
