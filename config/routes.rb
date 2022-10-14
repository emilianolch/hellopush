Rails.application.routes.draw do
  root 'notifications#index'

  resources :notifications, only: :index
end
