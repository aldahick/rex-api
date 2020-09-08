import * as aws from "aws-sdk";
import { singleton } from "tsyringe";
import { ConfigService } from "../config";

@singleton()
export class AwsService {
  private readonly sns = new aws.SNS(this.config.aws);

  constructor(
    private readonly config: ConfigService
  ) { }

  async createSnsEndpointArn(platform: keyof ConfigService["aws"]["snsArns"], token: string): Promise<string | undefined> {
    const platformArn = this.config.aws.snsArns[platform];
    if (platformArn === undefined) {
      throw new Error(`Missing environment variable to create endpoint for platform "${platform}"`);
    }
    /* eslint-disable @typescript-eslint/naming-convention */
    const { EndpointArn: arn } = await this.sns.createPlatformEndpoint({
      PlatformApplicationArn: platformArn,
      Token: token
      /* eslint-enable @typescript-eslint/naming-convention */
    }).promise();
    return arn;
  }

  async deleteSnsEndpointArn(platform: keyof ConfigService["aws"]["snsArns"], arn: string): Promise<void> {
    const platformArn = this.config.aws.snsArns[platform];
    if (platformArn === undefined) {
      throw new Error(`Missing environment variable to create endpoint for platform "${platform}"`);
    }
    await this.sns.deleteEndpoint({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      EndpointArn: arn
    }).promise();
  }
}
