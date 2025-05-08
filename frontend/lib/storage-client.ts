import lighthouse from "@lighthouse-web3/sdk";

export const uploadAsJson = async (dto: any) => {
  // Convert metadata to a Blob
  const jsonBlob = new Blob([JSON.stringify(dto)], {
    type: "application/json",
  });
  const file = new File([jsonBlob], "metadata.json", {
    type: "application/json",
  });

  // Use lighthouse.upload to upload the file
  const { data } = await lighthouse.upload(
    [file], // Pass as a file array
    process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY as string
  );

  return data;
};
