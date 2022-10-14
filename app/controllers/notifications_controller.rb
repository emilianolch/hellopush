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
    respond_to do |format|
      format.html { head :no_content }
    end
  end
end
