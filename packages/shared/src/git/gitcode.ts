// import type {
//   DeleteFileOptions,
//   GitClient,
//   GitClientOptions,
//   GitTreeResponse,
//   UploadFileOptions,
//   UploadImageOptions,
//   UploadResult
// } from "./type.ts";
//
// export function createGitcodeRestClient(options: GitClientOptions): GitClient {
//   // const { } = options;
//
//   return {
//     type: "gitcode",
//     deleteFile(options: DeleteFileOptions): Promise<void> {
//       return Promise.resolve(undefined);
//     },
//     getExistingFileSha(path: string, branch: string): Promise<string | undefined> {
//       return Promise.resolve(undefined);
//     },
//     getTree(ref?: string, recursive?: boolean): Promise<GitTreeResponse> {
//       return Promise.resolve(undefined);
//     },
//     uploadFile(options: UploadFileOptions): Promise<UploadResult> {
//       return Promise.resolve(undefined);
//     },
//     uploadImage(options: UploadImageOptions): Promise<UploadResult> {
//       return Promise.resolve(undefined);
//     },
//   };
// }