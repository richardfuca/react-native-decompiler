export default interface CmdArgs {
  in: string;
  out: string;
  bundlesFolder: string;
  entry: number;
  performance: boolean;
  verbose: boolean;
  decompileIgnored: boolean;
  /** skips some cache checks at the expense of possible cache desync */
  agressiveCache: boolean;
  noEslint: boolean;
  noPrettier: boolean;
  unpackOnly: boolean;
}
