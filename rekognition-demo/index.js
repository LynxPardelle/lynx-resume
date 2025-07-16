import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
const client = new RekognitionClient({ region: "us-east-1" });
const cmd = new DetectLabelsCommand({
  Image: { S3Object: { Bucket: "ai-demo-rek", Name: "450107705_10224964188560263_4324232269044804333_n.jpg" } },
  MaxLabels: 10,
  MinConfidence: 80
});
const resp = await client.send(cmd);
console.log("resp.Labels :", resp.Labels);
const cmd2 = new DetectLabelsCommand({
  Image: { S3Object: { Bucket: "ai-demo-rek", Name: "450354606_481728557836309_2021194488705367903_n.jpg" } },
  MaxLabels: 10,
  MinConfidence: 80
});
const resp2 = await client.send(cmd2);
console.log("resp2.Labels :", resp2.Labels);