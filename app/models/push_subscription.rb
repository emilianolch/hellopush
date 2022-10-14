class PushSubscription < ApplicationRecord
  validates_presence_of :endpoint, :p256dh, :auth
end
