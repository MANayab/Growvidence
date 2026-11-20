export interface BundleResolverOptions {
  outputDirectory: string;
  basePath?: string;
  siteOrigin?: string;
  htmlPath?: string;
}

export function htmlJavaScriptReferences(html: string): Set<string>;

export function resolveAssetPath(
  reference: string,
  parentFile: string | null,
  options: Required<
    Pick<BundleResolverOptions, "outputDirectory" | "basePath" | "siteOrigin">
  >,
): string | null;

export function collectLoadedJavaScript(
  initialReferences: Iterable<string>,
  options: BundleResolverOptions,
): Promise<Set<string>>;

export function assertHasJavaScriptAssets(assets: Set<string>): void;
