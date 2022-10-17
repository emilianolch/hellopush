class NotificationsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :save_subscription, if: -> { request.format.json? }

  def index; end

  def save_subscription
    unless PushSubscription.find_by(endpoint: params[:endpoint])
      PushSubscription.create(endpoint: params[:endpoint], p256dh: params[:keys][:p256dh], auth: params[:keys][:auth])
    end

    respond_to do |format|
      format.json { head :no_content }
    end
  end

  def send_message
    message = {
      title: 'Hello push!',
      options: {
        body: FortuneGem.give_fortune(max_length: 100),
        icon: ActionController::Base.helpers.image_path('rails.png'),
        tag: 'default-tag',
        renotify: true
      },
      data: {
        url: root_url
      }
    }

    respond_to do |format|
      format.turbo_stream do
        subscriber = PushSubscription.find_by(endpoint: params[:endpoint])
        Webpush.payload_send(
          message: message.to_json,
          endpoint: subscriber.endpoint,
          p256dh: subscriber.p256dh,
          auth: subscriber.auth,

          vapid: {
            subject: 'mailto:sender@example.com',
            public_key: ENV['VAPID_PUBLIC_KEY'],
            private_key: ENV['VAPID_PRIVATE_KEY'],
            expiration: 12 * 60 * 60
          },
          ssl_timeout: 5,
          open_timeout: 5,
          read_timeout: 5
        )
        render turbo_stream: turbo_stream.append('messages', "Message sent at #{Time.now}\n")
      rescue StandardError => e
        render turbo_stream: turbo_stream.append('messages', "#{e.message}\n")
      end
    end
  end
end
