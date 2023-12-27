import axios from "axios";

export class SMSService {
  private static SERVER_URL = "https://smsapp.uz/new";
  private static AUTH_KEY = "0c65574ca2213da4c9a22bf336b778c66071552e";

  /**
   * @param string     number      The mobile number where you want to send message.
   * @param string     message     The message you want to send.
   * @param int|string device      The ID of a device you want to use to send this message.
   * @param int        schedule    Set it to timestamp when you want to send this message.
   * @param bool       isMMS       Set it to true if you want to send MMS message instead of SMS.
   * @param string     attachments Comma separated list of image links you want to attach to the message. Only works for MMS messages.
   * @param bool       prioritize  Set it to true if you want to prioritize this message.
   *
   * @return array     Returns The array containing information about the message.
   * @throws Exception If there is an error while sending a message.
   */
  public static sendSingleMessage = (
    number: string,
    message: string,
    device = 0,
    schedule = null,
    isMMS = false,
    attachments = null,
    prioritize = false
  ) => {
    let url = `${this.SERVER_URL}/services/send.php`;
    let postData = {
      number,
      message,
      device,
      schedule,
      isMMS: isMMS ? "mms" : "sms",
      attachments,
      prioritize: prioritize ? 1 : 0,
      key: this.AUTH_KEY,
    };
    return axios.get(url, { params: postData });
  };
}
