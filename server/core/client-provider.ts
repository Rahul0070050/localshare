import { buildClientAppHtml } from '../../client/builder';

export function getClientApp(options: {
  hasPassword?: boolean;
}): string {
  return buildClientAppHtml({
    title: 'LocalShare',
    hasPassword: Boolean(options.hasPassword),
  });
}
